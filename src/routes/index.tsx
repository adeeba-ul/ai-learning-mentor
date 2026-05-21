import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Brain, Upload, Map, Sparkles, Compass, Target, TrendingUp,
  HeartHandshake, BookOpen, Wallet, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-24">
        {/* Hero */}
        <section className="py-20 text-center md:py-28">
          <div className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Strategic AI Compass · Powered by Gemini
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            When you're <span className="gradient-text">lost</span>, we hand you the map.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            CourseCompass analyzes your multi-dimensional profile — skills, personality blind spots,
            financial goals and uploaded credentials — and curates a live window into Coursera,
            self-improvement books and career blueprints calibrated for <em>you</em>.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="gradient-bg text-primary-foreground shadow-glow hover:opacity-90">
                Find my direction <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white/15">Sign in</Button>
            </Link>
          </div>
        </section>

        {/* Multi-dimensional pillars */}
        <section className="grid gap-5 md:grid-cols-4">
          {[
            { icon: Brain, title: "Personality blind spots", desc: "Detects what you don't see in yourself." },
            { icon: TrendingUp, title: "Career trajectory", desc: "Maps the next move that actually moves you." },
            { icon: Wallet, title: "Financial blueprint", desc: "Income scaling, freedom milestones, literacy gaps." },
            { icon: HeartHandshake, title: "Personal habits", desc: "Discipline, public speaking, emotional EQ." },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 shadow-soft transition-all duration-300 hover:shadow-glow">
              <div className="gradient-bg mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Journey */}
        <section className="mt-20 grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">A frictionless five-step compass</h2>
            <p className="mt-3 text-muted-foreground">
              From sign-in to your visual master roadmap, every screen propagates context instantly.
              No reload friction. No noise. Just direction.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                { icon: Compass, text: "Authenticate with email or Google OAuth" },
                { icon: Sparkles, text: "Complete the multi-dimensional Discovery Wizard" },
                { icon: Upload, text: "Drop in resumes & past certificates for AI extraction" },
                { icon: Target, text: "Browse a curated Coursera carousel with AI justifications" },
                { icon: Map, text: "Follow a glowing chronological learning roadmap" },
              ].map((i) => (
                <li key={i.text} className="flex items-start gap-3">
                  <i.icon className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{i.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-3xl p-8 shadow-glow">
            <div className="mb-4 text-xs uppercase tracking-widest text-primary">Suggestion vector preview</div>
            <div className="space-y-3">
              {[
                { tag: "Mindset", text: "Atomic Habits — re-architect identity" },
                { tag: "Technical", text: "Coursera · Machine Learning Specialization" },
                { tag: "Financial", text: "Coursera · Personal & Family Financial Planning" },
                { tag: "Career", text: "Stand-out portfolio: 3 deployable LLM apps" },
              ].map((s, i) => (
                <div key={s.text} className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/60 p-3">
                  <div className="gradient-bg flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-primary-foreground">{i + 1}</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-mint">{s.tag}</span>
                    <span className="text-sm">{s.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vault preview */}
        <section className="mt-20">
          <div className="glass rounded-3xl p-8 shadow-soft md:p-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-mint">Growth Vault</div>
                <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">Books and videos mapped to <em>your</em> weaknesses</h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Each item in the Vault links explicitly to one of the gaps the AI surfaces on your dashboard —
                  emotional intelligence, mental models, financial literacy, technical depth.
                </p>
              </div>
              <Link to="/signup">
                <Button className="gradient-bg text-primary-foreground shadow-glow">
                  <BookOpen className="mr-2 h-4 w-4" /> Open the Vault
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
