import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Award, BookOpen, AlertTriangle, Library, Compass, Briefcase, Wallet, Brain } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ certs: 0, skills: 0, saved: 0 });
  const [profile, setProfile] = useState<{ full_name: string | null; skills: string[] | null; career_goals: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profileData }, { count: certCount }, { count: savedCount }] = await Promise.all([
        supabase.from("profiles").select("full_name, skills, career_goals").eq("id", user.id).maybeSingle(),
        supabase.from("certificates").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("saved_courses").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setProfile(profileData);
      setStats({
        certs: certCount ?? 0,
        skills: profileData?.skills?.length ?? 0,
        saved: savedCount ?? 0,
      });
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-mint">Mentorship Command Center</div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Your AI mentor is ready. Re-run the discovery wizard to recompute your suggestion vector,
              or refresh recommendations to keep growing.
            </p>
          </div>
          <Link to="/wizard">
            <Button size="lg" className="gradient-bg text-primary-foreground shadow-glow">
              <Compass className="mr-2 h-4 w-4" /> Compute new suggestion vector
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Certificates", value: stats.certs, icon: Award },
          { label: "Detected skills", value: stats.skills, icon: Sparkles },
          { label: "Saved courses", value: stats.saved, icon: BookOpen },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-3xl font-bold">{loading ? "—" : s.value}</div>
          </div>
        ))}
      </div>

      {/* Holistic Weakness Diagnostic Panel */}
      <div className="glass rounded-2xl p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-mint" />
          <h3 className="font-semibold">Holistic weakness diagnostic</h3>
          <span className="ml-auto text-xs text-muted-foreground">Top 3 threats</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { icon: Briefcase, area: "Career", threat: "Portfolio lacks 1 deployed, end-to-end project recruiters can poke at.", action: "Ship a small full-stack ML app this month." },
            { icon: Wallet, area: "Financial", threat: "No clear income-scaling lever beyond salary increments.", action: "Pick one monetizable skill and validate $500 MRR." },
            { icon: Brain, area: "Personal", threat: "Reactive focus pattern — context-switching kills deep work.", action: "Lock in 2× 90-minute deep-work blocks daily." },
          ].map((w) => (
            <div key={w.area} className="rounded-xl border border-white/10 bg-card/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-mint">
                <w.icon className="h-3.5 w-3.5" /> {w.area}
              </div>
              <p className="mt-2 text-sm">{w.threat}</p>
              <p className="mt-2 text-xs text-muted-foreground"><span className="text-primary">Action →</span> {w.action}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/upload" className="glass group rounded-2xl p-6 shadow-soft transition hover:shadow-glow">
          <Upload className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-semibold">Upload a certificate</h3>
          <p className="mt-1 text-sm text-muted-foreground">Let AI extract skills and proficiency automatically.</p>
        </Link>
        <Link to="/recommendations" className="glass group rounded-2xl p-6 shadow-soft transition hover:shadow-glow">
          <Sparkles className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-semibold">Generate recommendations</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get a tailored list of Coursera courses for your goals.</p>
        </Link>
        <Link to="/vault" className="glass group rounded-2xl p-6 shadow-soft transition hover:shadow-glow">
          <Library className="h-6 w-6 text-mint" />
          <h3 className="mt-3 font-semibold">Growth Vault</h3>
          <p className="mt-1 text-sm text-muted-foreground">Books & videos mapped to your top weaknesses.</p>
        </Link>
      </div>

      <div className="glass rounded-2xl p-6 shadow-soft">
        <h3 className="mb-3 font-semibold">Your skills</h3>
        {profile?.skills && profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{s}</span>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No skills yet. <Link to="/wizard" className="text-primary hover:underline">Run the wizard</Link> or{" "}
            <Link to="/upload" className="text-primary hover:underline">upload a certificate</Link>.
          </div>
        )}
      </div>
    </div>
  );
}