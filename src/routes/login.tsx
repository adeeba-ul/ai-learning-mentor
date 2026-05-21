import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    router.navigate({ to: "/dashboard" });
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) return toast.error(result.error.message ?? "Google sign-in failed");
    if (!result.redirected) router.navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
        <div className="glass w-full rounded-3xl p-8 shadow-soft">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your learning journey.</p>

          <Button onClick={handleGoogle} variant="outline" className="mt-6 w-full">
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="gradient-bg w-full text-primary-foreground">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">Forgot password?</Link>
            <Link to="/signup" className="text-primary hover:underline">Create account</Link>
          </div>
        </div>
      </main>
    </div>
  );
}