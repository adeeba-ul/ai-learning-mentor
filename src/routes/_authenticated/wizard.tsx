import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Compass, ChevronLeft, ChevronRight, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/wizard")({
  component: WizardPage,
});

const STEPS = [
  { key: "identity", title: "Core personality & confusions" },
  { key: "goals", title: "Multi-goal alignment" },
  { key: "past", title: "Past footprint matrix" },
  { key: "review", title: "Review & launch" },
] as const;

function WizardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [blindSpots, setBlindSpots] = useState("");
  const [career, setCareer] = useState("");
  const [financial, setFinancial] = useState("");
  const [personal, setPersonal] = useState("");
  const [past, setPast] = useState("");
  const [completed, setCompleted] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setSkills((data.skills ?? []).join(", "));
        setInterests((data.interests ?? []).join(", "));
        setCareer(data.career_goals ?? "");
        setCompleted((data.completed_courses ?? []).join(", "));
      }
      setLoading(false);
    })();
  }, [user]);

  const toArr = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    const goalsBlob = [
      career && `Career: ${career}`,
      financial && `Financial: ${financial}`,
      personal && `Personal: ${personal}`,
      blindSpots && `Blind spots: ${blindSpots}`,
      past && `Past footprint: ${past}`,
    ].filter(Boolean).join("\n");

    const { error } = await supabase.from("profiles").update({
      skills: toArr(skills),
      interests: toArr(interests),
      completed_courses: toArr(completed),
      career_goals: goalsBlob,
    }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Context locked in — let's compute your vector");
    router.navigate({ to: "/recommendations" });
  };

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  if (loading) return <div className="glass rounded-2xl p-6 shadow-soft">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="gradient-bg flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-glow">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Context Discovery Wizard</h1>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length} · {STEPS[step].title}</p>
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div className="gradient-bg h-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="glass rounded-2xl p-6 shadow-soft">
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current technical skills (comma-separated)</Label>
              <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="python, react, sql" />
            </div>
            <div className="space-y-1.5">
              <Label>Interests you're drawn to</Label>
              <Input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="LLMs, design, investing" />
            </div>
            <div className="space-y-1.5">
              <Label>What makes you feel stuck? Personality blind spots?</Label>
              <Textarea rows={4} value={blindSpots} onChange={(e) => setBlindSpots(e.target.value)} placeholder="I procrastinate on shipping, fear of public speaking, weak at negotiation…" />
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Career ambitions</Label>
              <Textarea rows={3} value={career} onChange={(e) => setCareer(e.target.value)} placeholder="Become a senior ML engineer in 18 months, lead a team of 5…" />
            </div>
            <div className="space-y-1.5">
              <Label>Financial benchmarks</Label>
              <Textarea rows={3} value={financial} onChange={(e) => setFinancial(e.target.value)} placeholder="2x income in 24 months, $10k MRR side project, financial freedom by 40…" />
            </div>
            <div className="space-y-1.5">
              <Label>Personal milestones</Label>
              <Textarea rows={3} value={personal} onChange={(e) => setPersonal(e.target.value)} placeholder="Daily writing habit, run a half marathon, give a conference talk…" />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Past projects, failures, academic & professional background</Label>
              <Textarea rows={8} value={past} onChange={(e) => setPast(e.target.value)} placeholder="Built a startup that failed at distribution, CS undergrad, 2 yrs as data analyst…" />
            </div>
            <div className="space-y-1.5">
              <Label>Coursera courses already completed</Label>
              <Textarea rows={2} value={completed} onChange={(e) => setCompleted(e.target.value)} placeholder="Machine Learning, Deep Learning Specialization…" />
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: add resumes and certificates in the <span className="text-primary">Upload Certificate</span> screen for image OCR.
            </p>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4 text-sm">
            <Row label="Skills" value={skills || "—"} />
            <Row label="Interests" value={interests || "—"} />
            <Row label="Blind spots" value={blindSpots || "—"} />
            <Row label="Career" value={career || "—"} />
            <Row label="Financial" value={financial || "—"} />
            <Row label="Personal" value={personal || "—"} />
            <Row label="Past footprint" value={past || "—"} />
            <Row label="Completed" value={completed || "—"} />
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button className="gradient-bg text-primary-foreground" onClick={() => setStep((s) => s + 1)}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button className="gradient-bg text-primary-foreground shadow-glow" onClick={submit} disabled={saving}>
              {saving ? "Saving…" : <>Compute vector <Check className="ml-1 h-4 w-4" /></>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-white/5 pb-2">
      <div className="text-xs uppercase tracking-widest text-mint">{label}</div>
      <div className="col-span-2 whitespace-pre-wrap text-muted-foreground">{value}</div>
    </div>
  );
}