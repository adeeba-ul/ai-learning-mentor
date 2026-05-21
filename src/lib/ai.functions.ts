import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function callGemini(messages: Array<{ role: string; content: unknown }>) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, messages, response_format: { type: "json_object" } }),
  });
  if (res.status === 429) throw new Error("Rate limit exceeded. Try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted. Please add credits.");
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content);
  } catch {
    return { raw: content };
  }
}

export const analyzeCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ certificateId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: cert, error: certErr } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", data.certificateId)
      .eq("user_id", userId)
      .maybeSingle();
    if (certErr || !cert) throw new Error("Certificate not found");

    // Create signed URL so Gemini can fetch the image
    const { data: signed } = await supabase.storage
      .from("certificates")
      .createSignedUrl(cert.file_path, 600);

    const isImage = (cert.mime_type ?? "").startsWith("image/");
    const userContent: unknown = isImage && signed?.signedUrl
      ? [
          { type: "text", text: `Analyze this certificate (file: ${cert.file_name}). Extract structured data.` },
          { type: "image_url", image_url: { url: signed.signedUrl } },
        ]
      : `Analyze this certificate titled "${cert.file_name}". Infer skills based on the title and produce structured data.`;

    const result = await callGemini([
      {
        role: "system",
        content:
          'You are an expert credential analyzer. Return strict JSON with keys: title (string), skills (string[]), technologies (string[]), proficiency ("beginner"|"intermediate"|"advanced"|"expert"), summary (string, 2-3 sentences). Keep skills and technologies concise (max 10 each).',
      },
      { role: "user", content: userContent },
    ]);

    const update = {
      title: result.title ?? cert.file_name,
      extracted_skills: Array.isArray(result.skills) ? result.skills.slice(0, 20) : [],
      technologies: Array.isArray(result.technologies) ? result.technologies.slice(0, 20) : [],
      proficiency: typeof result.proficiency === "string" ? result.proficiency : null,
      summary: typeof result.summary === "string" ? result.summary : null,
      status: "analyzed",
      ai_raw: result,
    };
    const { error: upErr } = await supabase.from("certificates").update(update).eq("id", cert.id);
    if (upErr) throw new Error(upErr.message);

    // Merge new skills into profile
    const { data: profile } = await supabase.from("profiles").select("skills").eq("id", userId).maybeSingle();
    const merged = Array.from(new Set([...(profile?.skills ?? []), ...update.extracted_skills]));
    await supabase.from("profiles").update({ skills: merged }).eq("id", userId);

    return { ok: true, ...update };
  });

export const generateRecommendations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: certs }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("certificates").select("title,extracted_skills,technologies,proficiency,summary").eq("user_id", userId),
    ]);

    const ctx = {
      interests: profile?.interests ?? [],
      career_goals: profile?.career_goals ?? "",
      skills: profile?.skills ?? [],
      completed_courses: profile?.completed_courses ?? [],
      certificates: certs ?? [],
    };

    const result = await callGemini([
      {
        role: "system",
        content:
          'You are an expert Coursera learning advisor. Return strict JSON: { "courses": Array<{title: string, provider: string, url: string, category: string, level: "beginner"|"intermediate"|"advanced", rationale: string, prerequisite?: boolean}>, "roadmap": Array<{stage: string, focus: string, courses: string[]}>, "insights": string[] }. Recommend 6-9 real Coursera courses with realistic coursera.org URLs. Build a 4-stage roadmap from current level to career goal.',
      },
      {
        role: "user",
        content: `Generate personalized Coursera recommendations for this learner:\n${JSON.stringify(ctx, null, 2)}`,
      },
    ]);

    const { data: rec, error } = await supabase
      .from("recommendations")
      .insert({ user_id: userId, payload: result })
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return rec;
  });