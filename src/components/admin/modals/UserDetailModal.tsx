import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fullName = useMemo(() => {
    if (!profile) return "";
    return [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email;
  }, [profile]);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      console.log("[UserDetailModal] loading", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,first_name,last_name,user_role,is_super_admin,created_at,organization_name")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      setProfile((data as UserProfile) || null);
      console.log("[UserDetailModal] loaded", data);
    } catch (e: any) {
      console.error("[UserDetailModal] load error", e);
      toast.error(e?.message || "Nem sikerült betölteni a felhasználót");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
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
              <Badge variant="outline">{profile.is_super_admin ? "super_admin" : profile.user_role}</Badge>
            </div>

            <Separator />

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Szervezet</div>
                <div className="font-medium">{profile.organization_name || "-"}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Csatlakozott</div>
                <div className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Aktivitás</div>
                <div className="font-medium">-</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Foglalások</div>
                <div className="font-medium">0</div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bezárás
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
