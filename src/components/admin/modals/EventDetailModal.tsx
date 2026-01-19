import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location_name: string | null;
  location_address: string | null;
  status: string | null;
  current_participants: number | null;
  max_participants: number | null;
  is_public: boolean | null;
}

export function EventDetailModal(props: {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const { eventId, open, onOpenChange, onSaved } = props;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<EventRow | null>(null);

  const load = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      console.log("[EventDetailModal] loading", eventId);
      const { data, error } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
      if (error) throw error;
      setEvent((data as EventRow) || null);
      console.log("[EventDetailModal] loaded", data);
    } catch (e: any) {
      console.error("[EventDetailModal] load error", e);
      toast.error(e?.message || "Nem sikerült betölteni az eseményt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventId]);

  const save = async () => {
    if (!event) return;
    setSaving(true);
    try {
      console.log("[EventDetailModal] save", event.id);
      const { error } = await supabase
        .from("events")
        .update({
          title: event.title,
          description: event.description,
          location_name: event.location_name,
          location_address: event.location_address,
          status: event.status,
          is_public: event.is_public,
          max_participants: event.max_participants,
        })
        .eq("id", event.id);
      if (error) throw error;
      toast.success("Mentve");
      onSaved?.();
      await load();
    } catch (e: any) {
      console.error("[EventDetailModal] save error", e);
      toast.error(e?.message || "Mentés sikertelen");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Esemény részletek</DialogTitle>
        </DialogHeader>

        {!eventId ? (
          <div>Hiányzó azonosító</div>
        ) : loading ? (
          <div>Betöltés...</div>
        ) : !event ? (
          <div>Nincs találat</div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Cím</Label>
                <Input id="title" value={event.title} onChange={(e) => setEvent({ ...event, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Időpont</Label>
                <Input value={new Date(event.start_date).toLocaleString()} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Helyszín</Label>
                <Input value={event.location_name || ""} onChange={(e) => setEvent({ ...event, location_name: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Leírás</Label>
                <Textarea value={event.description || ""} onChange={(e) => setEvent({ ...event, description: e.target.value })} />
              </div>
            </div>

            <Separator />

            <div className="grid gap-2">
              <div className="text-sm text-muted-foreground">Résztvevők: {(event.current_participants ?? 0)}/{event.max_participants ?? "-"}</div>
              <div className="text-sm text-muted-foreground">Státusz: {event.status || "-"}</div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={save} disabled={!event || saving || loading}>
            Mentés
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
