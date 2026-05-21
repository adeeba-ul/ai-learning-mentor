import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sparkles, ExternalLink, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { generateRecommendations } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/recommendations")({
  component: RecommendationsPage,
});

type Course = { title: string; provider?: string; url?: string; category?: string; level?: string; rationale?: string; prerequisite?: boolean };
type Payload = { courses?: Course[]; roadmap?: { stage: string; focus: string; courses: string[] }[]; insights?: string[] };

function RecommendationsPage() {
  const { user } = useAuth();
  const generate = useServerFn(generateRecommendations);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadLatest = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("recommendations")
      .select("payload")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setPayload((data?.payload as Payload) ?? null);
    setLoading(false);
  };

  useEffect(() => { loadLatest(); }, [user]);

  const onGenerate = async () => {
    setGenerating(true);
    try {
      await generate({});
      await loadLatest();
      toast.success("Fresh recommendations ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const save = async (c: Course) => {
    if (!user) return;
    const { error } = await supabase.from("saved_courses").insert({
      user_id: user.id,
      title: c.title,
      provider: c.provider ?? "Coursera",
      url: c.url ?? null,
      category: c.category ?? null,
      level: c.level ?? null,
      rationale: c.rationale ?? null,
    });
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">AI recommendations</h1>
          <p className="text-sm text-muted-foreground">Personalized Coursera courses based on your skills and goals.</p>
        </div>
        <Button onClick={onGenerate} disabled={generating} className="gradient-bg text-primary-foreground">
          <Sparkles className="mr-2 h-4 w-4" />
          {generating ? "Generating…" : payload ? "Regenerate" : "Generate"}
        </Button>
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-6 shadow-soft">Loading…</div>
      ) : !payload ? (
        <div className="glass rounded-2xl p-8 text-center shadow-soft">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">No recommendations yet. Generate your first set.</p>
        </div>
      ) : (
        <>
          {payload.insights && payload.insights.length > 0 && (
            <div className="glass rounded-2xl p-6 shadow-soft">
              <h3 className="mb-3 font-semibold">AI insights</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {payload.insights.map((i, idx) => <li key={idx}>• {i}</li>)}
              </ul>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {(payload.courses ?? []).map((c, i) => (
              <div key={i} className="glass rounded-2xl p-5 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{c.level ?? "course"}</span>
                      {c.prerequisite && <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">prerequisite</span>}
                      {c.category && <span className="text-xs text-muted-foreground">{c.category}</span>}
                    </div>
                    <h3 className="mt-2 font-semibold">{c.title}</h3>
                    {c.rationale && <p className="mt-1 text-sm text-muted-foreground">{c.rationale}</p>}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open
                      </Button>
                    </a>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => save(c)}>
                    <Bookmark className="mr-1.5 h-3.5 w-3.5" /> Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}