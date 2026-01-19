import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Star, Trash2, CheckCircle, XCircle } from "lucide-react";

interface ProgramRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  is_published: boolean | null;
  is_featured: boolean | null;
  creator_id: string | null;
  created_at: string | null;
  price_huf: number | null;
  max_capacity: number | null;
  used_licenses: number | null;
  total_licenses: number | null;
}

const CATEGORIES = [
  { value: "workshop", label: "Műhely" },
  { value: "course", label: "Tanfolyam" },
  { value: "coaching", label: "Coaching" },
  { value: "consulting", label: "Konzultáció" },
  { value: "event", label: "Esemény" },
  { value: "other", label: "Egyéb" },
];

export function ProgramDetailModal(props: {
  programId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const { programId, open, onOpenChange, onSaved } = props;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [program, setProgram] = useState<ProgramRow | null>(null);
  const [expertName, setExpertName] = useState<string>("-");
  const [sponsorName, setSponsorName] = useState<string>("-");
  const [bookingsCount, setBookingsCount] = useState<number>(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const status = useMemo(() => (program?.is_published ? "published" : "draft"), [program?.is_published]);

  const load = async () => {
    if (!programId) return;
    setLoading(true);
    setIsEditing(false);
    try {
      console.log("[ProgramDetailModal] loading", programId);
      const { data, error } = await supabase
        .from("expert_contents")
        .select("id,title,description,category,is_published,is_featured,creator_id,created_at,price_huf,max_capacity,used_licenses,total_licenses")
        .eq("id", programId)
        .maybeSingle();
      if (error) throw error;

      setProgram((data as ProgramRow) || null);

      if (data?.creator_id) {
        const { data: expert } = await supabase.from("profiles").select("first_name,last_name").eq("id", data.creator_id).maybeSingle();
        setExpertName([expert?.first_name, expert?.last_name].filter(Boolean).join(" ") || "-");
      } else {
        setExpertName("-");
      }

      // Fixed JOIN query for sponsor
      const { data: sponsorship } = await supabase
        .from("content_sponsorships")
        .select("sponsor_id, sponsors(name)")
        .eq("content_id", programId)
        .eq("is_active", true)
        .maybeSingle();
      
      setSponsorName((sponsorship as any)?.sponsors?.name || "-");

      // Count content_access as bookings
      const { count } = await supabase
        .from("content_access")
        .select("*", { count: 'exact', head: true })
        .eq("content_id", programId);
      setBookingsCount(count || 0);

      console.log("[ProgramDetailModal] loaded", { program: data?.id, expertName, sponsorName });
    } catch (e: any) {
      console.error("[ProgramDetailModal] load error", e);
      toast.error(e?.message || "Nem sikerült betölteni a programot");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, programId]);

  const save = async () => {
    if (!program) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("expert_contents")
        .update({
          title: program.title,
          description: program.description,
          category: program.category,
          price_huf: program.price_huf,
          max_capacity: program.max_capacity,
          is_published: program.is_published,
          is_featured: program.is_featured,
        })
        .eq("id", program.id)
        .select("*")
        .single();

      if (error) throw error;

      console.log('DB SUCCESS:', data);

      toast.success("Mentve!");
      setIsEditing(false);
      onSaved?.();
      await load();
    } catch (e: any) {
      console.error('DB ERROR:', e);
      toast.error(e?.message || "Mentés sikertelen");
    } finally {
      setSaving(false);
    }
  };

  const approve = async () => {
    if (!program) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("expert_contents")
        .update({ is_published: true })
        .eq("id", program.id)
        .select("*")
        .single();
      if (error) throw error;

      console.log('DB SUCCESS:', data);

      toast.success("Program jóváhagyva!");
      onSaved?.();
      await load();
    } catch (e: any) {
      console.error('DB ERROR:', e);
      toast.error(e?.message || "Jóváhagyás sikertelen");
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    if (!program) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("expert_contents")
        .update({ is_published: false })
        .eq("id", program.id)
        .select("*")
        .single();
      if (error) throw error;

      console.log('DB SUCCESS:', data);

      toast.success("Program elutasítva!");
      onSaved?.();
      await load();
    } catch (e: any) {
      console.error('DB ERROR:', e);
      toast.error(e?.message || "Elutasítás sikertelen");
    } finally {
      setSaving(false);
    }
  };

  const deleteProgram = async () => {
    if (!program) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("expert_contents")
        .delete()
        .eq("id", program.id)
        .select("*")
        .maybeSingle();
      if (error) throw error;

      console.log('DB SUCCESS:', data);

      toast.success("Program törölve!");
      onSaved?.();
      onOpenChange(false);
    } catch (e: any) {
      console.error('DB ERROR:', e);
      toast.error(e?.message || "Törlés sikertelen");
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
    }
  };

  const toggleFeatured = async () => {
    if (!program) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("expert_contents")
        .update({ is_featured: !program.is_featured })
        .eq("id", program.id)
        .select("*")
        .single();
      if (error) throw error;

      console.log('DB SUCCESS:', data);

      toast.success(program.is_featured ? "Kiemelt státusz eltávolítva" : "Kiemeltté téve!");
      await load();
    } catch (e: any) {
      console.error('DB ERROR:', e);
      toast.error(e?.message || "Művelet sikertelen");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = () => {
    if (!program) return null;
    if (program.is_published) {
      return <Badge className="bg-emerald-100 text-emerald-700">Publikált</Badge>;
    }
    return <Badge variant="secondary">Vázlat</Badge>;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Program részletek
              {program?.is_featured && (
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              )}
            </DialogTitle>
          </DialogHeader>

          {!programId ? (
            <div>Hiányzó azonosító</div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : !program ? (
            <div>Nincs találat</div>
          ) : (
            <div className="space-y-4">
              {/* Header with status */}
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  {isEditing ? (
                    <Input
                      value={program.title}
                      onChange={(e) => setProgram({ ...program, title: e.target.value })}
                      className="text-lg font-semibold"
                    />
                  ) : (
                    <div className="font-semibold text-lg">{program.title}</div>
                  )}
                  <div className="text-sm text-muted-foreground truncate">{program.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge()}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFeatured}
                    disabled={saving}
                    title={program.is_featured ? "Kiemelt eltávolítása" : "Kiemeltté tenni"}
                  >
                    <Star className={`h-5 w-5 ${program.is_featured ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Info grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Szakértő</span>
                  <span className="font-medium">{expertName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Szponzor</span>
                  <span className="font-medium">{sponsorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Foglalások</span>
                  <span className="font-medium">{bookingsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Helyek</span>
                  <span className="font-medium">
                    {(program.used_licenses ?? 0)}/{(program.total_licenses ?? program.max_capacity ?? 0) || "-"}
                  </span>
                </div>
              </div>

              {/* Editable fields */}
              {isEditing ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Kategória</Label>
                    <Select value={program.category || ""} onValueChange={(v) => setProgram({ ...program, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Válassz..." /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ár (HUF)</Label>
                    <Input
                      type="number"
                      value={program.price_huf || ""}
                      onChange={(e) => setProgram({ ...program, price_huf: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max létszám</Label>
                    <Input
                      type="number"
                      value={program.max_capacity || ""}
                      onChange={(e) => setProgram({ ...program, max_capacity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2 flex items-center gap-3 pt-6">
                    <Switch
                      checked={program.is_published || false}
                      onCheckedChange={(v) => setProgram({ ...program, is_published: v })}
                    />
                    <Label>Publikált</Label>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Leírás</Label>
                    <Textarea
                      value={program.description || ""}
                      onChange={(e) => setProgram({ ...program, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Kategória:</span>
                    <span>{CATEGORIES.find(c => c.value === program.category)?.label || program.category || "-"}</span>
                    <span className="text-muted-foreground ml-4">Ár:</span>
                    <span>{program.price_huf?.toLocaleString() || "-"} Ft</span>
                  </div>
                  {program.description && (
                    <>
                      <Separator />
                      <div>
                        <div className="font-medium mb-1">Leírás</div>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">{program.description}</div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 flex-wrap">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditing(false); load(); }}>Mégse</Button>
                <Button onClick={save} disabled={saving}>{saving ? "Mentés..." : "Mentés"}</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Bezárás</Button>
                <Button variant="outline" onClick={() => setIsEditing(true)}>Szerkesztés</Button>
                {!program?.is_published && (
                  <Button onClick={approve} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="h-4 w-4 mr-1" /> Jóváhagyás
                  </Button>
                )}
                {program?.is_published && (
                  <Button variant="secondary" onClick={reject} disabled={saving}>
                    <XCircle className="h-4 w-4 mr-1" /> Elutasítás
                  </Button>
                )}
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={saving}>
                  <Trash2 className="h-4 w-4 mr-1" /> Törlés
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Program törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törölni szeretnéd a <strong>{program?.title}</strong> programot? Ez a művelet nem visszavonható.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction onClick={deleteProgram} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
