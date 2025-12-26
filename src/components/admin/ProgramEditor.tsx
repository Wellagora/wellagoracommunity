import { useState, useEffect } from "react";
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
  title: z.string().min(1, "Cím kötelező"),
  description: z.string().min(1, "Leírás kötelező"),
  points_base: z.number().min(1, "Pontok száma kötelező"),
  duration_days: z.number().min(1, "Időtartam kötelező"),
  is_continuous: z.boolean(),
  location: z.string().optional(),
});

type ProgramFormData = z.infer<typeof programSchema>;

interface ProgramData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points_base: number;
  duration_days: number;
  is_continuous: boolean;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  image_url?: string | null;
  project_id?: string | null;
}

export const ProgramEditor = ({ 
  programId,
  onSuccess,
  onCancel
}: { 
  programId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isContinuous, setIsContinuous] = useState(true);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("18:00");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [programData, setProgramData] = useState<ProgramData | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
  });

  // Load program data
  useEffect(() => {
    const loadProgram = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('challenge_definitions')
          .select('*')
          .eq('id', programId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProgramData(data);
          setValue('title', data.title);
          setValue('description', data.description);
          setValue('points_base', data.points_base);
          setValue('duration_days', data.duration_days);
          setValue('is_continuous', data.is_continuous);
          setValue('location', data.location || '');
          
          setIsContinuous(data.is_continuous);
          setCurrentImageUrl(data.image_url);
          
          if (data.start_date) {
            const startDateTime = new Date(data.start_date);
            setStartDate(startDateTime);
            setStartTime(format(startDateTime, 'HH:mm'));
          }
          
          if (data.end_date) {
            const endDateTime = new Date(data.end_date);
            setEndDate(endDateTime);
            setEndTime(format(endDateTime, 'HH:mm'));
          }
        }
      } catch (error: any) {
        console.error('Error loading program:', error);
        toast.error('Hiba történt a program betöltésekor');
      } finally {
        setIsLoading(false);
      }
    };

    loadProgram();
  }, [programId, setValue]);

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

  const removeCurrentImage = async () => {
    if (!currentImageUrl) return;
    
    try {
      // Extract filename from URL
      const url = new URL(currentImageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // Delete from storage
      await supabase.storage
        .from('program-images')
        .remove([fileName]);
      
      setCurrentImageUrl(null);
      toast.success('Kép törölve');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Hiba történt a kép törlése során');
    }
  };

  const onSubmit = async (data: ProgramFormData) => {
    setIsSubmitting(true);

    try {
      console.log('[ProgramEditor] Submitting update for programId:', programId);

      // 1) Verify record exists (detect static/mock programs)
      const { data: existing, error: existingError } = await supabase
        .from('challenge_definitions')
        .select('id, title, project_id')
        .eq('id', programId)
        .maybeSingle();

      console.log('[ProgramEditor] Existing record:', existing);
      console.log('[ProgramEditor] Existing error:', existingError);

      if (existingError) throw existingError;

      if (!existing) {
        toast.error('Program not found in database (might be static data).');
        return;
      }

      let imageUrl = currentImageUrl;

      // Upload new image if provided
      if (uploadedImage) {
        const fileExt = uploadedImage.name.split('.').pop();
        const fileName = `${programId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('program-images')
          .upload(fileName, uploadedImage);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('program-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;

        // Delete old image if exists
        if (currentImageUrl) {
          try {
            const url = new URL(currentImageUrl);
            const pathParts = url.pathname.split('/');
            const oldFileName = pathParts[pathParts.length - 1];
            await supabase.storage.from('program-images').remove([oldFileName]);
          } catch (e) {
            console.error('[ProgramEditor] Error deleting old image:', e);
          }
        }
      }

      // Combine date and time for scheduled events
      let startDateTime: Date | null = null;
      let endDateTime: Date | null = null;

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

      const updateData = {
        title: data.title,
        description: data.description,
        points_base: data.points_base,
        duration_days: data.duration_days,
        is_continuous: isContinuous,
        start_date: startDateTime?.toISOString() || null,
        end_date: endDateTime?.toISOString() || null,
        location: data.location || null,
        image_url: imageUrl,
      };

      console.log('[ProgramEditor] Update payload:', updateData);

      const { data: updatedRows, error: updateError } = await supabase
        .from('challenge_definitions')
        .update(updateData)
        .eq('id', programId)
        .select('id, title, project_id');

      console.log('[ProgramEditor] Update result rows:', updatedRows);
      console.log('[ProgramEditor] Update error:', updateError);

      if (updateError) throw updateError;

      if (!updatedRows || updatedRows.length === 0) {
        toast.error('Update succeeded but no row was returned/updated. Check RLS and ID match.');
        return;
      }

      toast.success('Program sikeresen frissítve!');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('[ProgramEditor] Error updating program:', error);
      toast.error(error?.message || 'Hiba történt a program frissítése során');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Program szerkesztése</CardTitle>
        <CardDescription>
          Módosítsd a program adatait
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
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

          {/* Image Upload/Edit */}
          <div className="space-y-2">
            <Label>Program fénykép</Label>
            {currentImageUrl && !imagePreview ? (
              <div className="relative">
                <img
                  src={currentImageUrl}
                  alt="Jelenlegi kép"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeCurrentImage}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="mt-2">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Új kép feltöltése
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>
            ) : !imagePreview ? (
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

          {/* Submit Buttons */}
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Mégse
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mentés...
                </>
              ) : (
                "Mentés"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};