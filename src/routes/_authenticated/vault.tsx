import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Play, ExternalLink, Library } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/vault")({
  component: VaultPage,
});

const BOOKS = [
  { title: "Atomic Habits", author: "James Clear", weakness: "Discipline & identity", url: "https://jamesclear.com/atomic-habits" },
  { title: "Deep Work", author: "Cal Newport", weakness: "Focus & shipping", url: "https://www.calnewport.com/books/deep-work/" },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", weakness: "Mental models", url: "https://www.penguinrandomhouse.com/books/89308/thinking-fast-and-slow-by-daniel-kahneman/" },
  { title: "The Psychology of Money", author: "Morgan Housel", weakness: "Financial literacy", url: "https://www.morganhousel.com/" },
  { title: "Never Split the Difference", author: "Chris Voss", weakness: "Negotiation & EQ", url: "https://www.blackswanltd.com/" },
  { title: "The Almanack of Naval Ravikant", author: "Eric Jorgenson", weakness: "Wealth frameworks", url: "https://www.navalmanack.com/" },
] as const;

const VIDEOS = [
  { title: "How to Be Confident — Charisma on Command", weakness: "Public speaking", url: "https://www.youtube.com/c/CharismaonCommand" },
  { title: "Ali Abdaal — Productivity systems that actually work", weakness: "Focus", url: "https://www.youtube.com/@aliabdaal" },
  { title: "Andrew Huberman — Tools to manage stress", weakness: "Mental resilience", url: "https://www.youtube.com/@hubermanlab" },
  { title: "Naval — How to Get Rich (without getting lucky)", weakness: "Financial mindset", url: "https://nav.al/rich" },
] as const;

export default function VaultPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="gradient-bg flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-glow">
          <Library className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Growth Vault</h1>
          <p className="text-sm text-muted-foreground">Books and videos mapped to the weaknesses your AI mentor has surfaced.</p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-widest text-mint">Strategic books</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {BOOKS.map((b) => (
            <div key={b.title} className="glass rounded-2xl p-5 shadow-soft transition-all duration-300 hover:shadow-glow">
              <div className="flex items-start gap-3">
                <BookOpen className="mt-1 h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-widest text-mint">{b.weakness}</div>
                  <h3 className="mt-1 font-semibold">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.author}</p>
                </div>
              </div>
              <a href={b.url} target="_blank" rel="noreferrer" className="mt-3 inline-block">
                <Button variant="outline" size="sm" className="border-white/15">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Explore
                </Button>
              </a>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-widest text-mint">Curated videos & channels</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {VIDEOS.map((v) => (
            <div key={v.title} className="glass rounded-2xl p-5 shadow-soft transition-all duration-300 hover:shadow-glow">
              <div className="flex items-start gap-3">
                <Play className="mt-1 h-5 w-5 text-mint" />
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-widest text-mint">{v.weakness}</div>
                  <h3 className="mt-1 font-semibold">{v.title}</h3>
                </div>
              </div>
              <a href={v.url} target="_blank" rel="noreferrer" className="mt-3 inline-block">
                <Button variant="outline" size="sm" className="border-white/15">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Watch
                </Button>
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}