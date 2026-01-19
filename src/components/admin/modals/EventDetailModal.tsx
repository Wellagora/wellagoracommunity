import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { CalendarIcon, Trash2, MapPin, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
  is_all_day: boolean | null;
  created_at: string | null;
  created_by: string | null;
}

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Ütemezett" },
  { value: "active", label: "Aktív" },
  { value: "completed", label: "Befejezett" },
  { value: "cancelled", label: "Törölve" },
];

export function EventDetailModal(props: {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const { eventId, open, onOpenChange, onSaved } = props;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [creatorName, setCreatorName] = useState<string>("-");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const load = async () => {
    if (!eventId) return;
    setLoading(true);
    setIsEditing(false);
    try {
      console.log("[EventDetailModal] loading", eventId);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .maybeSingle();
      if (error) throw error;
      setEvent((data as EventRow) || null);

      if (data?.created_by) {
        const { data: creator } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", data.created_by)
          .maybeSingle();
        setCreatorName([creator?.first_name, creator?.last_name].filter(Boolean).join(" ") || "-");
      } else {
        setCreatorName("-");
      }

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
          start_date: event.start_date,
          end_date: event.end_date,
          location_name: event.location_name,
          location_address: event.location_address,
          status: event.status,
          is_public: event.is_public,
          is_all_day: event.is_all_day,
          max_participants: event.max_participants,
        })
        .eq("id", event.id);
      if (error) throw error;
      toast.success("Mentve!");
      setIsEditing(false);
      onSaved?.();
      await load();
    } catch (e: any) {
      console.error("[EventDetailModal] save error", e);
      toast.error(e?.message || "Mentés sikertelen");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async () => {
    if (!event) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);
      if (error) throw error;

      toast.success("Esemény törölve!");
      onSaved?.();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Törlés sikertelen");
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusBadge = () => {
    if (!event?.status) return <Badge variant="secondary">Nincs státusz</Badge>;
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      scheduled: { variant: "secondary", label: "Ütemezett" },
      active: { variant: "default", label: "Aktív" },
      completed: { variant: "secondary", label: "Befejezett" },
      cancelled: { variant: "destructive", label: "Törölve" },
    };
    const config = statusConfig[event.status] || { variant: "secondary", label: event.status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Esemény részletek</DialogTitle>
          </DialogHeader>

          {!eventId ? (
            <div>Hiányzó azonosító</div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : !event ? (
            <div>Nincs találat</div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label>Cím</Label>
                      <Input
                        value={event.title}
                        onChange={(e) => setEvent({ ...event, title: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="font-semibold text-lg">{event.title}</div>
                  )}
                </div>
                {!isEditing && getStatusBadge()}
              </div>

              <Separator />

              {isEditing ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Date picker */}
                  <div className="space-y-2">
                    <Label>Kezdő dátum</Label>
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !event.start_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {event.start_date ? format(new Date(event.start_date), "yyyy.MM.dd HH:mm", { locale: hu }) : "Válassz dátumot"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={event.start_date ? new Date(event.start_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const currentTime = event.start_date
                                ? new Date(event.start_date).toTimeString().slice(0, 5)
                                : "10:00";
                              const [hours, mins] = currentTime.split(':');
                              date.setHours(parseInt(hours), parseInt(mins));
                              setEvent({ ...event, start_date: date.toISOString() });
                            }
                            setDatePickerOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label>Státusz</Label>
                    <Select value={event.status || ""} onValueChange={(v) => setEvent({ ...event, status: v })}>
                      <SelectTrigger><SelectValue placeholder="Válassz..." /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label>Helyszín neve</Label>
                    <Input
                      value={event.location_name || ""}
                      onChange={(e) => setEvent({ ...event, location_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Helyszín címe</Label>
                    <Input
                      value={event.location_address || ""}
                      onChange={(e) => setEvent({ ...event, location_address: e.target.value })}
                    />
                  </div>

                  {/* Max participants */}
                  <div className="space-y-2">
                    <Label>Max résztvevők</Label>
                    <Input
                      type="number"
                      value={event.max_participants || ""}
                      onChange={(e) => setEvent({ ...event, max_participants: Number(e.target.value) })}
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={event.is_public || false}
                        onCheckedChange={(v) => setEvent({ ...event, is_public: v })}
                      />
                      <Label>Nyilvános</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={event.is_all_day || false}
                        onCheckedChange={(v) => setEvent({ ...event, is_all_day: v })}
                      />
                      <Label>Egész napos</Label>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Leírás</Label>
                    <Textarea
                      value={event.description || ""}
                      onChange={(e) => setEvent({ ...event, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Info display */}
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Időpont:</span>
                      <span className="font-medium">{format(new Date(event.start_date), "yyyy.MM.dd HH:mm", { locale: hu })}</span>
                      {event.is_all_day && <Badge variant="outline">Egész napos</Badge>}
                    </div>
                    {event.location_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Helyszín:</span>
                        <span className="font-medium">{event.location_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Résztvevők:</span>
                      <span className="font-medium">
                        {event.current_participants ?? 0}/{event.max_participants ?? "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Létrehozta:</span>
                      <span className="font-medium">{creatorName}</span>
                    </div>
                  </div>

                  {event.description && (
                    <>
                      <Separator />
                      <div>
                        <div className="font-medium mb-1">Leírás</div>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</div>
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
            <AlertDialogTitle>Esemény törlése</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan törölni szeretnéd a <strong>{event?.title}</strong> eseményt? Ez a művelet nem visszavonható.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction onClick={deleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
