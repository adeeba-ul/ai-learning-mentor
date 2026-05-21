import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Award, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ certs: 0, skills: 0, saved: 0 });
  const [profile, setProfile] = useState<{ full_name: string | null; skills: string[] | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profileData }, { count: certCount }, { count: savedCount }] = await Promise.all([
        supabase.from("profiles").select("full_name, skills").eq("id", user.id).maybeSingle(),
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
        <h1 className="text-2xl font-bold">Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your AI mentor is ready. Upload certificates or refresh recommendations to keep growing.
        </p>
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

      <div className="grid gap-4 md:grid-cols-2">
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
            No skills yet. <Link to="/profile" className="text-primary hover:underline">Add some</Link> or{" "}
            <Link to="/upload" className="text-primary hover:underline">upload a certificate</Link>.
          </div>
        )}
      </div>
    </div>
  );
}