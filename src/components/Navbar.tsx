import { Link, useRouter } from "@tanstack/react-router";
import { Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3 shadow-soft">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="gradient-bg flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg">CourseMentor</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link to="/" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Home</Link>
          {user && (
            <>
              <Link to="/dashboard" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Dashboard</Link>
              <Link to="/recommendations" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Recommendations</Link>
              <Link to="/roadmap" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Roadmap</Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link to="/signup"><Button size="sm" className="gradient-bg text-primary-foreground hover:opacity-90">Get started</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}