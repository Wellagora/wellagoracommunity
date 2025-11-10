import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarIcon, Loader2, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const programSchema = z.object({
  id: z.string().min(1, "ID kötelező"),
  title: z.string().min(1, "Cím kötelező"),
  description: z.string().min(1, "Leírás kötelező"),
  category: z.string().min(1, "Kategória kötelező"),
  difficulty: z.string().min(1, "Nehézség kötelező"),
  points_base: z.number().min(1, "Pontok száma kötelező"),
  duration_days: z.number().min(1, "Időtartam kötelező"),
  is_continuous: z.boolean(),
  location: z.string().optional(),
});

type ProgramFormData = z.infer<typeof programSchema>;

export const ProgramCreator = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContinuous, setIsContinuous] = useState(true);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("18:00");

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      is_continuous: true,
      points_base: 100,
      duration_days: 1,
    }
  });

  const onSubmit = async (data: ProgramFormData) => {
    setIsSubmitting(true);
    
    try {
      // Combine date and time for scheduled events
      let startDateTime = null;
      let endDateTime = null;
      
      if (!isContinuous && startDate) {
        const [startHour, startMinute] = startTime.split(':');
        startDateTime = new Date(startDate);
        startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
      }
      
      if (!isContinuous && endDate) {
        const [endHour, endMinute] = endTime.split(':');
        endDateTime = new Date(endDate);
        endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);
      }

      const { error } = await supabase
        .from('challenge_definitions')
        .insert({
          id: data.id,
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty,
          points_base: data.points_base,
          duration_days: data.duration_days,
          is_continuous: isContinuous,
          start_date: startDateTime?.toISOString(),
          end_date: endDateTime?.toISOString(),
          location: data.location || null,
          is_active: true,
          base_impact: {},
        });

      if (error) throw error;

      toast.success(t('admin.program_created_success') || 'Program sikeresen létrehozva!');
      reset();
      setStartDate(undefined);
      setEndDate(undefined);
      setIsContinuous(true);
    } catch (error: any) {
      console.error('Error creating program:', error);
      toast.error(error.message || t('admin.program_created_error') || 'Hiba történt a program létrehozásakor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Új program létrehozása</CardTitle>
        <CardDescription>
          Hozz létre új fenntarthatósági programot a közösség számára
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="id">Program ID *</Label>
              <Input
                id="id"
                placeholder="kali-muhely"
                {...register("id")}
              />
              {errors.id && <p className="text-sm text-destructive mt-1">{errors.id.message}</p>}
            </div>

            <div>
              <Label htmlFor="title">Cím *</Label>
              <Input
                id="title"
                placeholder="Káli Műhely"
                {...register("title")}
              />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Leírás *</Label>
              <Textarea
                id="description"
                placeholder="A program részletes leírása..."
                rows={4}
                {...register("description")}
              />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Kategória *</Label>
                <Select onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz kategóriát" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="energy">Energia</SelectItem>
                    <SelectItem value="transport">Közlekedés</SelectItem>
                    <SelectItem value="food">Élelmiszer</SelectItem>
                    <SelectItem value="waste">Hulladék</SelectItem>
                    <SelectItem value="community">Közösség</SelectItem>
                    <SelectItem value="innovation">Innováció</SelectItem>
                    <SelectItem value="water">Víz</SelectItem>
                    <SelectItem value="biodiversity">Biodiverzitás</SelectItem>
                    <SelectItem value="circular-economy">Körforgásos gazdaság</SelectItem>
                    <SelectItem value="green-finance">Zöld finanszírozás</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <Label htmlFor="difficulty">Nehézség *</Label>
                <Select onValueChange={(value) => setValue("difficulty", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz nehézséget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Kezdő</SelectItem>
                    <SelectItem value="intermediate">Haladó</SelectItem>
                    <SelectItem value="advanced">Tapasztalt</SelectItem>
                    <SelectItem value="expert">Szakértő</SelectItem>
                  </SelectContent>
                </Select>
                {errors.difficulty && <p className="text-sm text-destructive mt-1">{errors.difficulty.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="points_base">Pontok *</Label>
                <Input
                  id="points_base"
                  type="number"
                  placeholder="100"
                  {...register("points_base", { valueAsNumber: true })}
                />
                {errors.points_base && <p className="text-sm text-destructive mt-1">{errors.points_base.message}</p>}
              </div>

              <div>
                <Label htmlFor="duration_days">Időtartam (nap) *</Label>
                <Input
                  id="duration_days"
                  type="number"
                  placeholder="1"
                  {...register("duration_days", { valueAsNumber: true })}
                />
                {errors.duration_days && <p className="text-sm text-destructive mt-1">{errors.duration_days.message}</p>}
              </div>
            </div>
          </div>

          {/* Event Type Toggle */}
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
            <Switch
              id="is_continuous"
              checked={isContinuous}
              onCheckedChange={(checked) => {
                setIsContinuous(checked);
                setValue("is_continuous", checked);
              }}
            />
            <Label htmlFor="is_continuous" className="cursor-pointer">
              {isContinuous ? "Folyamatos program" : "Konkrét esemény (időponttal)"}
            </Label>
          </div>

          {/* Event Details - Only shown for scheduled events */}
          {!isContinuous && (
            <div className="space-y-4 p-4 border border-accent/20 rounded-lg bg-accent/5">
              <h3 className="font-semibold text-sm">Esemény részletek</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kezdés dátuma *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "yyyy. MM. dd.") : "Válassz dátumot"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Kezdés időpontja *</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Zárás dátuma</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "yyyy. MM. dd.") : "Válassz dátumot"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Zárás időpontja</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Helyszín</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Káli Művelődési Ház"
                    className="pl-10"
                    {...register("location")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Létrehozás...
              </>
            ) : (
              "Program létrehozása"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
