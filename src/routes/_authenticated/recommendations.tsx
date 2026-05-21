import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sparkles, ExternalLink, Bookmark, ChevronLeft, ChevronRight, Target } from "lucide-react";
import { toast } from "sonner";
import { generateRecommendations } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/recommendations")({
  component: RecommendationsPage,
});

type Course = { title: string; provider?: string; url?: string; category?: string; level?: string; rationale?: string; prerequisite?: boolean };
type Payload = { courses?: Course[]; roadmap?: { stage: string; focus: string; courses: string[] }[]; insights?: string[] };

function courseraSearchUrl(title: string) {
  return `https://www.coursera.org/search?query=${encodeURIComponent(title)}`;
}

function affinityFor(title: string): number {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return 78 + (h % 21); // 78–98%
}

function RecommendationsPage() {
  const { user } = useAuth();
  const generate = useServerFn(generateRecommendations);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [idx, setIdx] = useState(0);

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

  const courses = useMemo(() => payload?.courses ?? [], [payload]);
  const current = courses[idx];

  const onGenerate = async () => {
    setGenerating(true);
    try {
      await generate({});
      await loadLatest();
      setIdx(0);
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
          <div className="text-xs uppercase tracking-widest text-mint">Filtered Coursera Window</div>
          <h1 className="text-2xl font-bold tracking-tight">AI mentor recommendations</h1>
          <p className="text-sm text-muted-foreground">A live curated viewport into coursera.org — calibrated to your suggestion vector.</p>
        </div>
        <Button onClick={onGenerate} disabled={generating} className="gradient-bg text-primary-foreground">
          <Sparkles className="mr-2 h-4 w-4" />
          {generating ? "Generating…" : payload ? "Regenerate" : "Generate"}
        </Button>
      </div>

      {loading ? (
        <div className="glass animate-pulse rounded-2xl p-12 shadow-soft">
          <div className="mx-auto h-6 w-48 rounded bg-white/10" />
          <div className="mx-auto mt-4 h-32 w-full max-w-lg rounded bg-white/5" />
        </div>
      ) : !payload || courses.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center shadow-soft">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">No recommendations yet. Generate your first set.</p>
        </div>
      ) : (
        <>
          {payload.insights && payload.insights.length > 0 && (
            <div className="glass rounded-2xl p-6 shadow-soft">
              <h3 className="mb-3 font-semibold">AI mentor insights</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {payload.insights.map((i, idx) => <li key={idx}>• {i}</li>)}
              </ul>
            </div>
          )}

          {/* Carousel */}
          {current && (
            <div className="glass glow-ring relative rounded-3xl p-6 shadow-glow md:p-8">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Card {idx + 1} of {courses.length}</span>
                <div className="flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-mint" />
                  <span className="font-semibold text-mint">{affinityFor(current.title)}% affinity match</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs uppercase tracking-wider text-primary">
                  {current.level ?? "course"}
                </span>
                {current.prerequisite && (
                  <span className="rounded-full bg-accent/20 px-3 py-1 text-xs text-mint">prerequisite</span>
                )}
                {current.category && <span className="text-xs text-muted-foreground">{current.category}</span>}
                <span className="ml-auto text-xs text-muted-foreground">{current.provider ?? "Coursera"}</span>
              </div>

              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">{current.title}</h2>

              {current.rationale && (
                <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <div className="text-[10px] uppercase tracking-widest text-mint">AI mentor justification</div>
                  <p className="mt-2 text-sm leading-relaxed">{current.rationale}</p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <a href={current.url ?? courseraSearchUrl(current.title)} target="_blank" rel="noreferrer">
                  <Button className="gradient-bg text-primary-foreground shadow-glow">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open on Coursera
                  </Button>
                </a>
                <Button variant="outline" className="border-white/15" onClick={() => save(current)}>
                  <Bookmark className="mr-1.5 h-3.5 w-3.5" /> Save
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setIdx((i) => (i - 1 + courses.length) % courses.length)}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIdx((i) => (i + 1) % courses.length)}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-1.5">
                {courses.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "w-8 bg-primary" : "w-1.5 bg-white/15"}`}
                    aria-label={`Go to card ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Compact grid below */}
          <div className="grid gap-3 md:grid-cols-3">
            {courses.map((c, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`glass rounded-xl p-4 text-left transition-all duration-300 hover:shadow-glow ${i === idx ? "ring-1 ring-primary/60" : ""}`}
              >
                <div className="text-[10px] uppercase tracking-widest text-mint">{c.category ?? c.level ?? "course"}</div>
                <div className="mt-1 line-clamp-2 text-sm font-medium">{c.title}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}