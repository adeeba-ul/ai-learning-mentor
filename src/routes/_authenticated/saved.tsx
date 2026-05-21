import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, Bookmark } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/saved")({
  component: SavedPage,
});

type Saved = { id: string; title: string; provider: string | null; url: string | null; category: string | null; level: string | null; rationale: string | null };

function SavedPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Saved[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("saved_courses").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setItems((data as Saved[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user]);

  const remove = async (id: string) => {
    await supabase.from("saved_courses").delete().eq("id", id);
    toast.success("Removed");
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Saved courses</h1>
        <p className="text-sm text-muted-foreground">Your bookmarked Coursera courses.</p>
      </div>
      {loading ? (
        <div className="glass rounded-2xl p-6 shadow-soft">Loading…</div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center shadow-soft">
          <Bookmark className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">No saved courses yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-5 shadow-soft">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {c.level && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{c.level}</span>}
                {c.category && <span>{c.category}</span>}
              </div>
              <h3 className="mt-2 font-semibold">{c.title}</h3>
              {c.rationale && <p className="mt-1 text-sm text-muted-foreground">{c.rationale}</p>}
              <div className="mt-4 flex items-center gap-2">
                {c.url && (
                  <a href={c.url} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm"><ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open</Button>
                  </a>
                )}
                <Button variant="ghost" size="sm" onClick={() => remove(c.id)}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}