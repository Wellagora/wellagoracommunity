import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface SponsorRow {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  location_city: string | null;
  is_active: boolean | null;
  is_verified: boolean | null;
  created_at: string | null;
}

export function SponsorDetailModal(props: {
  sponsorId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const { sponsorId, open, onOpenChange, onSaved } = props;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sponsor, setSponsor] = useState<SponsorRow | null>(null);
  const [activeCampaigns, setActiveCampaigns] = useState<number>(0);

  const statusLabel = useMemo(() => (sponsor?.is_active ? "Aktív" : "Inaktív"), [sponsor?.is_active]);

  const load = async () => {
    if (!sponsorId) return;
    setLoading(true);
    try {
      console.log("[SponsorDetailModal] loading", sponsorId);
      const { data, error } = await supabase.from("sponsors").select("*").eq("id", sponsorId).maybeSingle();
      if (error) throw error;

      const { count, error: cErr } = await supabase
        .from("content_sponsorships")
        .select("*", { count: "exact", head: true })
        .eq("sponsor_id", sponsorId)
        .eq("is_active", true);
      if (cErr) throw cErr;

      setSponsor((data as SponsorRow) || null);
      setActiveCampaigns(count || 0);
      console.log("[SponsorDetailModal] loaded", { sponsor: data, activeCampaigns: count || 0 });
    } catch (e: any) {
      console.error("[SponsorDetailModal] load error", e);
      toast.error(e?.message || "Nem sikerült betölteni a szponzort");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sponsorId]);

  const save = async () => {
    if (!sponsor) return;
    setSaving(true);
    try {
      console.log("[SponsorDetailModal] save", sponsor.id);
      const { error } = await supabase
        .from("sponsors")
        .update({
          name: sponsor.name,
          slug: sponsor.slug,
          logo_url: sponsor.logo_url,
          website_url: sponsor.website_url,
          description: sponsor.description,
          location_city: sponsor.location_city,
          is_active: sponsor.is_active,
          is_verified: sponsor.is_verified,
        })
        .eq("id", sponsor.id);
      if (error) throw error;
      toast.success("Mentve");
      onSaved?.();
      await load();
    } catch (e: any) {
      console.error("[SponsorDetailModal] save error", e);
      toast.error(e?.message || "Mentés sikertelen");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Szponzor részletek</DialogTitle>
        </DialogHeader>

        {!sponsorId ? (
          <div>Hiányzó azonosító</div>
        ) : loading ? (
          <div>Betöltés...</div>
        ) : !sponsor ? (
          <div>Nincs találat</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-semibold truncate">{sponsor.name}</div>
                <div className="text-sm text-muted-foreground truncate">{sponsor.website_url || "-"}</div>
              </div>
              <Badge variant="outline">{statusLabel}</Badge>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Cégnév</Label>
                <Input id="name" value={sponsor.name} onChange={(e) => setSponsor({ ...sponsor, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={sponsor.slug || ""} onChange={(e) => setSponsor({ ...sponsor, slug: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url">Weboldal</Label>
                <Input
                  id="website_url"
                  value={sponsor.website_url || ""}
                  onChange={(e) => setSponsor({ ...sponsor, website_url: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={sponsor.logo_url || ""}
                  onChange={(e) => setSponsor({ ...sponsor, logo_url: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Leírás</Label>
                <Textarea
                  id="description"
                  value={sponsor.description || ""}
                  onChange={(e) => setSponsor({ ...sponsor, description: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Aktív kampányok</div>
                <div className="font-medium">{activeCampaigns}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Kreditek</div>
                <div className="font-medium">-</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Kapcsolat</div>
                <div className="font-medium">-</div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={save} disabled={!sponsor || saving || loading}>
            Mentés
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
