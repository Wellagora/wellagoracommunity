import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface ProgramRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  is_published: boolean | null;
  creator_id: string | null;
  created_at: string | null;
  price_huf: number | null;
  max_capacity: number | null;
  used_licenses: number | null;
  total_licenses: number | null;
}

export function ProgramDetailModal(props: {
  programId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { programId, open, onOpenChange } = props;

  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState<ProgramRow | null>(null);
  const [expertName, setExpertName] = useState<string>("-");
  const [sponsorName, setSponsorName] = useState<string>("-");
  const [bookingsCount, setBookingsCount] = useState<number>(0);

  const status = useMemo(() => (program?.is_published ? "published" : "draft"), [program?.is_published]);

  const load = async () => {
    if (!programId) return;
    setLoading(true);
    try {
      console.log("[ProgramDetailModal] loading", programId);
      const { data, error } = await supabase
        .from("expert_contents")
        .select("id,title,description,category,is_published,creator_id,created_at,price_huf,max_capacity,used_licenses,total_licenses")
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

      const { data: sponsorship } = await supabase
        .from("content_sponsorships")
        .select("sponsors(name)")
        .eq("content_id", programId)
        .eq("is_active", true)
        .maybeSingle();
      setSponsorName((sponsorship as any)?.sponsors?.name || "-");

      // No bookings table exists in this project (verified via information_schema). Keep placeholder.
      setBookingsCount(0);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Program részletek</DialogTitle>
        </DialogHeader>

        {!programId ? (
          <div>Hiányzó azonosító</div>
        ) : loading ? (
          <div>Betöltés...</div>
        ) : !program ? (
          <div>Nincs találat</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-semibold truncate">{program.title}</div>
                <div className="text-sm text-muted-foreground truncate">{program.id}</div>
              </div>
              <Badge variant="outline">{status}</Badge>
            </div>

            <Separator />

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Szakértő</div>
                <div className="font-medium">{expertName}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Szponzor</div>
                <div className="font-medium">{sponsorName}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Foglalások</div>
                <div className="font-medium">{bookingsCount}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Helyek</div>
                <div className="font-medium">
                  {(program.used_licenses ?? 0)}/{(program.total_licenses ?? program.max_capacity ?? 0) || "-"}
                </div>
              </div>
            </div>

            {program.description && (
              <>
                <Separator />
                <div>
                  <div className="font-medium">Leírás</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{program.description}</div>
                </div>
              </>
            )}
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
