import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [interests, setInterests] = useState("");
  const [skills, setSkills] = useState("");
  const [completed, setCompleted] = useState("");
  const [goals, setGoals] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setFullName(data.full_name ?? "");
        setInterests((data.interests ?? []).join(", "));
        setSkills((data.skills ?? []).join(", "));
        setCompleted((data.completed_courses ?? []).join(", "));
        setGoals(data.career_goals ?? "");
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const toArr = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName,
      interests: toArr(interests),
      skills: toArr(skills),
      completed_courses: toArr(completed),
      career_goals: goals,
    }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
  };

  if (loading) return <div className="glass rounded-2xl p-6 shadow-soft">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your profile</h1>
        <p className="text-sm text-muted-foreground">Help the AI recommend better courses.</p>
      </div>
      <form onSubmit={save} className="glass space-y-4 rounded-2xl p-6 shadow-soft">
        <div className="space-y-1.5">
          <Label>Full name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Career goals</Label>
          <Textarea rows={3} placeholder="e.g. Become a senior ML engineer in 18 months" value={goals} onChange={(e) => setGoals(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Interests (comma-separated)</Label>
          <Input placeholder="machine learning, data engineering, design" value={interests} onChange={(e) => setInterests(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Skills (comma-separated)</Label>
          <Input placeholder="python, sql, react" value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Completed Coursera courses</Label>
          <Textarea rows={2} placeholder="Machine Learning, Deep Learning Specialization, ..." value={completed} onChange={(e) => setCompleted(e.target.value)} />
        </div>
        <Button type="submit" disabled={saving} className="gradient-bg text-primary-foreground">
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </div>
  );
}