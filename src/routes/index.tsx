import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Brain, Upload, Map, Sparkles, GraduationCap, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-24">
        <section className="py-20 text-center md:py-28">
          <div className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Powered by Gemini AI
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Your AI mentor for the right{" "}
            <span className="gradient-text">Coursera path</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            Upload your certificates, share your goals, and let AI design a personalized
            roadmap of Coursera courses tailored to your career.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="gradient-bg text-primary-foreground shadow-glow hover:opacity-90">
                Start free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">Sign in</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Upload, title: "Upload certificates", desc: "Drop in your Coursera certificates as images or PDFs." },
            { icon: Brain, title: "AI skill extraction", desc: "Gemini analyzes credentials and detects your real skills." },
            { icon: Map, title: "Personalized roadmap", desc: "A clear, stage-by-stage path to your next career milestone." },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 shadow-soft">
              <div className="gradient-bg mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">From your skills to your dream role</h2>
            <p className="mt-3 text-muted-foreground">
              CourseMentor understands your educational background and aligns each next
              course with your career goals — so every hour you spend learning compounds.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                { icon: GraduationCap, text: "Auto-detects skills and proficiency from uploaded certificates" },
                { icon: Target, text: "Curates advanced and prerequisite Coursera courses" },
                { icon: Map, text: "Visual roadmap with stages, focus areas, and next steps" },
              ].map((i) => (
                <li key={i.text} className="flex items-start gap-3">
                  <i.icon className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{i.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-3xl p-8 shadow-glow">
            <div className="space-y-3">
              {["Foundations · Python for Everybody", "Intermediate · Machine Learning Specialization", "Advanced · Deep Learning Specialization", "Capstone · AI for Medical Diagnosis"].map((s, i) => (
                <div key={s} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="gradient-bg flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-primary-foreground">{i + 1}</div>
                  <span className="text-sm">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
