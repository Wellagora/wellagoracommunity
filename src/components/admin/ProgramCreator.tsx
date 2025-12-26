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
import { CalendarIcon, Loader2, MapPin, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const programSchema = z.object({
  id: z.string().min(1, "ID kötelező"),
  title: z.string().min(1, "Cím kötelező"),
  description: z.string().min(1, "Leírás kötelező"),
  points_base: z.number().min(1, "Pontok száma kötelező"),
  duration_days: z.number().min(1, "Időtartam kötelező"),
  is_continuous: z.boolean(),
  location: z.string().optional(),
});

type ProgramFormData = z.infer<typeof programSchema>;

export const ProgramCreator = ({ 
  defaultProjectId,
  onSuccess 
}: { 
  defaultProjectId: string | null;
  onSuccess?: () => void;
}) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContinuous, setIsContinuous] = useState(true);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("18:00");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      is_continuous: true,
      points_base: 100,
      duration_days: 1,
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: ProgramFormData) => {
    setIsSubmitting(true);
    
    try {
      // Upload image if provided
      let imageUrl = null;
      if (uploadedImage) {
        const fileExt = uploadedImage.name.split('.').pop();
        const fileName = `${data.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('program-images')
          .upload(fileName, uploadedImage);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('program-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // Translate title and description automatically
      let translations = {};
      try {
        toast.info("Fordítás folyamatban...");
        
        const { data: translationData, error: translationError } = await supabase.functions
          .invoke('translate-challenge', {
            body: { 
              title: data.title, 
              description: data.description 
            }
          });
        
        if (translationError) {
          toast.warning("A fordítás sikertelen, de a program létrehozva magyarul");
        } else if (translationData?.translations) {
          translations = translationData.translations;
          toast.success(`Lefordítva ${Object.keys(translations).length} nyelvre`);
        }
      } catch {
        toast.warning("A fordítás sikertelen, de folytatom a program létrehozását");
      }

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
          category: 'community',
          difficulty: 'beginner',
          points_base: data.points_base,
          duration_days: data.duration_days,
          is_continuous: isContinuous,
          start_date: startDateTime?.toISOString(),
          end_date: endDateTime?.toISOString(),
          location: data.location || null,
          image_url: imageUrl,
          is_active: true,
          base_impact: {},
          project_id: defaultProjectId,
          translations: translations,
        });

      if (error) throw error;

      toast.success(t('admin.program_created_success') || 'Program sikeresen létrehozva és lefordítva!');
      reset();
      setStartDate(undefined);
      setEndDate(undefined);
      setIsContinuous(true);
      removeImage();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
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

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Program fénykép</Label>
            {!imagePreview ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Kattints ide vagy húzd ide a képet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, max 5MB
                  </p>
                </Label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Program előnézet"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
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
