import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { writeAuditLog } from "@/lib/auditLog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Award, Ban, RotateCcw } from "lucide-react";

type UserRoleType = "business" | "citizen" | "creator" | "expert" | "government" | "member" | "ngo" | "sponsor";

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_role: UserRoleType;
  is_super_admin: boolean | null;
  is_verified_expert: boolean | null;
  green_pass: boolean | null;
  suspended_at: string | null;
  suspended_by: string | null;
  suspended_reason: string | null;
  created_at: string;
  organization_name: string | null;
}

export function UserDetailModal(props: {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { userId, open, onOpenChange } = props;
  const { user: adminUser } = useAuth();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

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
        .select("id,email,first_name,last_name,user_role,is_super_admin,is_verified_expert,green_pass,suspended_at,suspended_by,suspended_reason,created_at,organization_name")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      setProfile((data as UserProfile) || null);
    } catch (e: any) {
      console.error("[UserDetailModal] load error", e);
      toast.error(t("admin.modal.load_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open, userId]);

  const save = async () => {
    if (!profile || !adminUser) return;
    setSaving(true);
    try {
      const updateData: Record<string, any> = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        user_role: profile.user_role,
        is_super_admin: profile.is_super_admin,
        is_verified_expert: profile.is_verified_expert,
        green_pass: profile.green_pass,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id);
      if (error) throw error;

      await writeAuditLog({
        action: 'admin_update_user',
        tableName: 'profiles',
        recordId: profile.id,
        userId: adminUser.id,
        userEmail: adminUser.email,
        newValues: updateData,
      });

      toast.success(t("admin.modal.save_success"));
      setIsEditing(false);
      await load();
    } catch (e: any) {
      toast.error(t("admin.modal.save_error") + ": " + (e?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const handleSuspend = async () => {
    if (!profile || !adminUser || !suspendReason.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          suspended_at: new Date().toISOString(),
          suspended_by: adminUser.id,
          suspended_reason: suspendReason.trim(),
        })
        .eq("id", profile.id);
      if (error) throw error;

      await writeAuditLog({
        action: 'admin_suspend_user',
        tableName: 'profiles',
        recordId: profile.id,
        userId: adminUser.id,
        userEmail: adminUser.email,
        newValues: { suspended_reason: suspendReason.trim() },
      });

      toast.success(t("admin.suspend_success") || "Felhasználó felfüggesztve");
      setSuspendDialogOpen(false);
      setSuspendReason("");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Hiba a felfüggesztés során");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async () => {
    if (!profile || !adminUser) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          suspended_at: null,
          suspended_by: null,
          suspended_reason: null,
        })
        .eq("id", profile.id);
      if (error) throw error;

      await writeAuditLog({
        action: 'admin_restore_user',
        tableName: 'profiles',
        recordId: profile.id,
        userId: adminUser.id,
        userEmail: adminUser.email,
        oldValues: { suspended_reason: profile.suspended_reason },
      });

      toast.success(t("admin.restore_success") || "Felfüggesztés feloldva");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Hiba a visszaállítás során");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!profile || !confirm(t("common.confirm_delete"))) return;
    toast.error(t("admin.modal.delete_not_allowed"));
  };

  const getDateLocale = () => {
    switch (language) {
      case 'hu': return 'hu-HU';
      case 'de': return 'de-DE';
      default: return 'en-US';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("admin.modal.user_details")}</DialogTitle>
        </DialogHeader>

        {!userId ? (
          <div>{t("admin.modal.missing_id")}</div>
        ) : loading ? (
          <div>{t("common.loading")}</div>
        ) : !profile ? (
          <div>{t("admin.modal.not_found")}</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-semibold truncate">{fullName}</div>
                <div className="text-sm text-muted-foreground truncate">{profile.email}</div>
              </div>
              <Badge variant="outline">{profile.is_super_admin ? "Super Admin" : profile.user_role}</Badge>
            </div>

            {/* Suspension banner */}
            {profile.suspended_at && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 space-y-1">
                <div className="flex items-center gap-2 text-red-700 font-medium">
                  <Ban className="h-4 w-4" />
                  {t("admin.suspended") || "Felfüggesztett felhasználó"}
                </div>
                {profile.suspended_reason && (
                  <div className="text-sm text-red-600">{t("admin.suspension_reason") || "Ok"}: {profile.suspended_reason}</div>
                )}
                <div className="text-xs text-red-500">
                  {new Date(profile.suspended_at).toLocaleDateString(getDateLocale())}
                </div>
              </div>
            )}

            <Separator />

            {isEditing ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("admin.modal.first_name")}</Label>
                  <Input value={profile.first_name || ""} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.modal.last_name")}</Label>
                  <Input value={profile.last_name || ""} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{t("admin.modal.role")}</Label>
                  <Select value={profile.user_role} onValueChange={(v) => setProfile({ ...profile, user_role: v as UserRoleType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">{t("roles.member") || "Member"}</SelectItem>
                      <SelectItem value="citizen">{t("roles.citizen") || "Citizen"}</SelectItem>
                      <SelectItem value="expert">{t("roles.expert") || "Expert"}</SelectItem>
                      <SelectItem value="creator">{t("roles.creator") || "Creator"}</SelectItem>
                      <SelectItem value="sponsor">{t("roles.sponsor") || "Sponsor"}</SelectItem>
                      <SelectItem value="business">{t("roles.business") || "Business"}</SelectItem>
                      <SelectItem value="ngo">{t("roles.ngo") || "NGO"}</SelectItem>
                      <SelectItem value="government">{t("roles.government") || "Government"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="min-w-0">
                      <div className="font-medium">Super Admin</div>
                      <div className="text-sm text-muted-foreground">
                        {t("admin.modal.super_admin_hint") || "Full access to /admin"}
                      </div>
                    </div>
                    <Switch
                      checked={profile.is_super_admin === true}
                      onCheckedChange={(v) => setProfile({ ...profile, is_super_admin: v })}
                    />
                  </div>
                </div>

                {/* Expert verification toggle */}
                {(profile.user_role === 'expert' || profile.user_role === 'creator') && (
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="min-w-0 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-medium">{t("admin.verified_expert") || "Verified Expert"}</div>
                          <div className="text-sm text-muted-foreground">
                            {t("admin.verified_expert_hint") || "Allow publishing programs"}
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={profile.is_verified_expert === true}
                        onCheckedChange={(v) => setProfile({ ...profile, is_verified_expert: v })}
                      />
                    </div>
                  </div>
                )}

                {/* Green Pass toggle */}
                {(profile.user_role === 'expert' || profile.user_role === 'creator') && (
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                      <div className="min-w-0 flex items-center gap-2">
                        <Award className="h-4 w-4 text-emerald-600" />
                        <div>
                          <div className="font-medium">{t("admin.green_pass") || "Green Pass"}</div>
                          <div className="text-sm text-muted-foreground">
                            {t("admin.green_pass_hint") || "Auto-publish programs without review"}
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={profile.green_pass === true}
                        onCheckedChange={(v) => setProfile({ ...profile, green_pass: v })}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-2">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("admin.modal.organization")}</span><span className="font-medium">{profile.organization_name || "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("admin.modal.registered")}</span><span className="font-medium">{new Date(profile.created_at).toLocaleDateString(getDateLocale())}</span></div>
                {(profile.user_role === 'expert' || profile.user_role === 'creator') && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("admin.verified_expert") || "Verified Expert"}</span>
                      <Badge variant={profile.is_verified_expert ? "default" : "secondary"}>{profile.is_verified_expert ? "✓" : "✗"}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("admin.green_pass") || "Green Pass"}</span>
                      <Badge variant={profile.green_pass ? "default" : "secondary"} className={profile.green_pass ? "bg-emerald-600" : ""}>{profile.green_pass ? "✓" : "✗"}</Badge>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Suspend dialog inline */}
            {suspendDialogOpen && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
                <Label className="text-red-700 font-medium">{t("admin.suspension_reason") || "Felfüggesztés indoka"}</Label>
                <Textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder={t("admin.suspension_reason_placeholder") || "Írd le a felfüggesztés okát..."}
                  className="border-red-200"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => { setSuspendDialogOpen(false); setSuspendReason(""); }}>{t("common.cancel")}</Button>
                  <Button variant="destructive" size="sm" onClick={handleSuspend} disabled={saving || !suspendReason.trim()}>
                    <Ban className="h-4 w-4 mr-1" />
                    {t("admin.suspend") || "Felfüggesztés"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 flex-wrap">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => { setIsEditing(false); load(); }}>{t("common.cancel")}</Button>
              <Button onClick={save} disabled={saving}>{saving ? t("common.saving") : t("common.save")}</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.close")}</Button>
              <Button onClick={() => setIsEditing(true)}>{t("common.edit")}</Button>
              {profile && !profile.suspended_at ? (
                <Button variant="destructive" size="sm" onClick={() => setSuspendDialogOpen(true)}>
                  <Ban className="h-4 w-4 mr-1" />
                  {t("admin.suspend") || "Felfüggesztés"}
                </Button>
              ) : profile?.suspended_at ? (
                <Button variant="outline" size="sm" className="border-emerald-500 text-emerald-700 hover:bg-emerald-50" onClick={handleRestore}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  {t("admin.restore") || "Visszaállítás"}
                </Button>
              ) : null}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}