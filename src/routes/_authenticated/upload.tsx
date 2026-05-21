import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload as UploadIcon, FileText, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { analyzeCertificate } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/upload")({
  component: UploadPage,
});

type Cert = {
  id: string;
  file_name: string;
  title: string | null;
  status: string;
  extracted_skills: string[] | null;
  technologies: string[] | null;
  proficiency: string | null;
  summary: string | null;
  file_path: string;
  created_at: string;
};

function UploadPage() {
  const { user } = useAuth();
  const analyze = useServerFn(analyzeCertificate);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [certs, setCerts] = useState<Cert[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setCerts((data as Cert[]) ?? []);
  };

  useEffect(() => { load(); }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    setUploading(true);
    try {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("certificates").upload(path, file);
      if (upErr) throw upErr;
      const { data: cert, error: dbErr } = await supabase
        .from("certificates")
        .insert({
          user_id: user.id,
          file_path: path,
          file_name: file.name,
          mime_type: file.type,
        })
        .select()
        .single();
      if (dbErr) throw dbErr;
      toast.success("Uploaded. Analyzing with AI…");
      setFile(null);
      await load();
      try {
        await analyze({ data: { certificateId: cert.id } });
        toast.success("Skills extracted!");
        await load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Analysis failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const reanalyze = async (id: string) => {
    toast.info("Re-analyzing…");
    try {
      await analyze({ data: { certificateId: id } });
      toast.success("Updated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const remove = async (c: Cert) => {
    await supabase.storage.from("certificates").remove([c.file_path]);
    await supabase.from("certificates").delete().eq("id", c.id);
    toast.success("Deleted");
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload certificates</h1>
        <p className="text-sm text-muted-foreground">Drop images or PDFs. AI extracts your skills automatically.</p>
      </div>

      <form onSubmit={handleUpload} className="glass rounded-2xl p-6 shadow-soft">
        <Label htmlFor="file">Certificate file</Label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Input id="file" type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Button type="submit" disabled={!file || uploading} className="gradient-bg text-primary-foreground">
            <UploadIcon className="mr-2 h-4 w-4" />
            {uploading ? "Uploading…" : "Upload & analyze"}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="font-semibold">Your certificates</h2>
        {certs.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-sm text-muted-foreground shadow-soft">No certificates yet.</div>
        ) : (
          certs.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{c.title ?? c.file_name}</div>
                    <div className="text-xs text-muted-foreground">
                      Status: <span className={c.status === "analyzed" ? "text-primary" : ""}>{c.status}</span>
                      {c.proficiency ? ` · ${c.proficiency}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => reanalyze(c.id)}>
                    <Sparkles className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(c)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {c.summary && <p className="mt-3 text-sm text-muted-foreground">{c.summary}</p>}
              {c.extracted_skills && c.extracted_skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.extracted_skills.map((s) => (
                    <span key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}