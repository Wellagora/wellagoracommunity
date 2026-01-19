import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

interface ExpertProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  expert_title: string | null;
  verification_status: string | null;
  is_verified_expert: boolean | null;
  is_super_admin: boolean | null;
  user_role: string;
  created_at: string;
}

interface ExpertProgram {
  id: string;
  title: string;
  is_published: boolean | null;
  created_at: string | null;
}

export function ExpertDetailModal(props: {
  expertId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerifiedOrRejected?: () => void;
}) {
  const { expertId, open, onOpenChange, onVerifiedOrRejected } = props;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [programs, setPrograms] = useState<ExpertProgram[]>([]);

  const fullName = useMemo(() => {
    if (!profile) return "";
    return [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email;
  }, [profile]);

  const load = async () => {
    if (!expertId) return;
    setLoading(true);
    try {
      console.log("[ExpertDetailModal] loading", expertId);
      const { data: p, error: pErr } = await supabase
        .from("profiles")
        .select("id,email,first_name,last_name,expert_title,verification_status,is_verified_expert,is_super_admin,user_role,created_at")
        .eq("id", expertId)
        .maybeSingle();
      if (pErr) throw pErr;

      const { data: progs, error: progErr } = await supabase
        .from("expert_contents")
        .select("id,title,is_published,created_at")
        .eq("creator_id", expertId)
        .order("created_at", { ascending: false });
      if (progErr) throw progErr;

      setProfile((p as ExpertProfile) || null);
      setPrograms((progs as ExpertProgram[]) || []);
      console.log("[ExpertDetailModal] loaded", { profile: p, programs: progs?.length || 0 });
    } catch (e: any) {
      console.error("[ExpertDetailModal] load error", e);
      toast.error(e?.message || "Nem sikerült betölteni a szakértőt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expertId]);

  const status = (profile?.verification_status || "unverified") as VerificationStatus;

  const saveBasic = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      console.log("[ExpertDetailModal] save", profile.id);
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          expert_title: profile.expert_title,
        })
        .eq("id", profile.id);
      if (error) throw error;
      toast.success("Mentve");
      await load();
    } catch (e: any) {
      console.error("[ExpertDetailModal] save error", e);
      toast.error(e?.message || "Mentés sikertelen");
    } finally {
      setSaving(false);
    }
  };

  const setVerification = async (next: VerificationStatus) => {
    if (!profile) return;
    setSaving(true);
    try {
      console.log("[ExpertDetailModal] setVerification", { id: profile.id, next });
      const { error } = await supabase.from("profiles").update({ verification_status: next }).eq("id", profile.id);
      if (error) throw error;
      toast.success(next === "verified" ? "Hitelesítve" : "Elutasítva");
      onVerifiedOrRejected?.();
      await load();
    } catch (e: any) {
      console.error("[ExpertDetailModal] verification error", e);
      toast.error(e?.message || "Művelet sikertelen");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Szakértő részletek</DialogTitle>
        </DialogHeader>

        {!expertId ? (
          <div>Hiányzó azonosító</div>
        ) : loading ? (
          <div>Betöltés...</div>
        ) : !profile ? (
          <div>Nincs találat</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-semibold truncate">{fullName}</div>
                <div className="text-sm text-muted-foreground truncate">{profile.email}</div>
              </div>
              <Badge variant="outline">{status}</Badge>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">Keresztnév</Label>
                <Input
                  id="first_name"
                  value={profile.first_name || ""}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Vezetéknév</Label>
                <Input
                  id="last_name"
                  value={profile.last_name || ""}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="expert_title">Szakértői cím</Label>
                <Input
                  id="expert_title"
                  value={profile.expert_title || ""}
                  onChange={(e) => setProfile({ ...profile, expert_title: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="font-medium">Programok ({programs.length})</div>
              <div className="space-y-2">
                {programs.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.id}</div>
                    </div>
                    <Badge variant="secondary">{p.is_published ? "published" : "draft"}</Badge>
                  </div>
                ))}
                {programs.length === 0 && <div className="text-sm text-muted-foreground">Nincs program</div>}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex flex-wrap gap-2 w-full justify-end">
            <Button variant="outline" onClick={saveBasic} disabled={!profile || saving || loading}>
              Mentés
            </Button>
            <Button
              variant="outline"
              onClick={() => setVerification("verified")}
              disabled={!profile || saving || loading}
            >
              Jóváhagyás
            </Button>
            <Button
              variant="destructive"
              onClick={() => setVerification("rejected")}
              disabled={!profile || saving || loading}
            >
              Elutasítás
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
