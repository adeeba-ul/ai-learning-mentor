import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Map as MapIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/roadmap")({
  component: RoadmapPage,
});

type Payload = { roadmap?: { stage: string; focus: string; courses: string[] }[] };

function RoadmapPage() {
  const { user } = useAuth();
  const [stages, setStages] = useState<Payload["roadmap"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("recommendations")
        .select("payload")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setStages((data?.payload as Payload)?.roadmap ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your learning roadmap</h1>
        <p className="text-sm text-muted-foreground">A stage-by-stage path from your current skills to your career goal.</p>
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-6 shadow-soft">Loading…</div>
      ) : !stages || stages.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center shadow-soft">
          <MapIcon className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            No roadmap yet. <Link to="/recommendations" className="text-primary hover:underline">Generate recommendations</Link> first.
          </p>
        </div>
      ) : (
        <div className="relative space-y-4 before:absolute before:left-5 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border md:before:left-6">
          {stages.map((s, i) => (
            <div key={i} className="glass relative rounded-2xl p-6 pl-14 shadow-soft md:pl-16">
              <div className="gradient-bg absolute left-1.5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-primary-foreground md:left-2">
                {i + 1}
              </div>
              <div className="text-xs uppercase tracking-wide text-primary">{s.stage}</div>
              <h3 className="mt-1 font-semibold">{s.focus}</h3>
              {s.courses && s.courses.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {s.courses.map((c) => <li key={c}>• {c}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}