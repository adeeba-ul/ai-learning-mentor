import { Link } from "@tanstack/react-router";
import { LayoutDashboard, User, Upload, Sparkles, Map, Bookmark } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/upload", label: "Upload Certificate", icon: Upload },
  { to: "/recommendations", label: "AI Recommendations", icon: Sparkles },
  { to: "/roadmap", label: "Learning Roadmap", icon: Map },
  { to: "/saved", label: "Saved Courses", icon: Bookmark },
] as const;

export function DashboardSidebar() {
  return (
    <aside className="glass hidden h-fit w-60 shrink-0 rounded-2xl p-3 shadow-soft lg:block">
      <nav className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}