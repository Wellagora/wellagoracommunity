import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_role: string;
  is_super_admin: boolean | null;
  created_at: string;
  organization_name: string | null;
}

export function UserDetailModal(props: {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { userId, open, onOpenChange } = props;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fullName = useMemo(() => {
    if (!profile) return "";
    return [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email;
  }, [profile]);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    setIsEditing(false);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,first_name,last_name,user_role,is_super_admin,created_at,organization_name")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      setProfile((data as UserProfile) || null);
    } catch (e: any) {
      console.error("[UserDetailModal] load error", e);
      toast.error("Nem sikerült betölteni a felhasználót");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open, userId]);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          user_role: profile.user_role,
        })
        .eq("id", profile.id);
      if (error) throw error;
      toast.success("Mentve!");
      setIsEditing(false);
      await load();
    } catch (e: any) {
      toast.error("Hiba: " + (e?.message || "Mentés sikertelen"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!profile || !confirm("Biztosan törölni szeretnéd ezt a felhasználót?")) return;
    toast.error("Felhasználó törlése nem engedélyezett biztonsági okokból.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Felhasználó részletek</DialogTitle>
        </DialogHeader>

        {!userId ? (
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
              <Badge variant="outline">{profile.is_super_admin ? "Super Admin" : profile.user_role}</Badge>
            </div>

            <Separator />

            {isEditing ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Keresztnév</Label>
                  <Input value={profile.first_name || ""} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Vezetéknév</Label>
                  <Input value={profile.last_name || ""} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Szerepkör</Label>
                  <Select value={profile.user_role} onValueChange={(v) => setProfile({ ...profile, user_role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Tag</SelectItem>
                      <SelectItem value="expert">Szakértő</SelectItem>
                      <SelectItem value="sponsor">Szponzor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Szervezet</span><span className="font-medium">{profile.organization_name || "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Regisztráció</span><span className="font-medium">{new Date(profile.created_at).toLocaleDateString("hu-HU")}</span></div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => { setIsEditing(false); load(); }}>Mégse</Button>
              <Button onClick={save} disabled={saving}>{saving ? "Mentés..." : "Mentés"}</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Bezárás</Button>
              <Button onClick={() => setIsEditing(true)}>Szerkesztés</Button>
              <Button variant="destructive" onClick={handleDelete}>Törlés</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}