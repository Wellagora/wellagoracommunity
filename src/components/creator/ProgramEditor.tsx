import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save,
  Send,
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  Loader2,
  Link as LinkIcon,
  DollarSign,
  FileText,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// URL validation regex - supports YouTube, Vimeo, Google Drive, and standard URLs
const urlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|vimeo\.com\/|player\.vimeo\.com\/video\/|drive\.google\.com\/|dropbox\.com\/|.+\..+)/i;

interface ProgramEditorProps {
  programId?: string;
  mode: "create" | "edit";
}

const ProgramEditor = ({ programId, mode }: ProgramEditorProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null);
  const [existingStatus, setExistingStatus] = useState<"draft" | "pending" | "published" | "rejected" | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Form schema with validation
  const formSchema = z.object({
    title: z.string()
      .min(3, t("creator.validation_title_length"))
      .max(100, t("creator.validation_title_length")),
    description: z.string()
      .min(10, t("creator.validation_desc_required"))
      .max(2000),
    category: z.string().optional(),
    access_level: z.enum(["free", "registered", "premium", "one_time_purchase"]),
    price_huf: z.number().optional(),
    content_url: z.string().optional(),
  }).refine((data) => {
    if (data.access_level === "one_time_purchase") {
      return data.price_huf !== undefined && data.price_huf >= 500;
    }
    return true;
  }, {
    message: t("creator.validation_price_min"),
    path: ["price_huf"],
  }).refine((data) => {
    if (data.content_url && data.content_url.trim() !== "") {
      return urlRegex.test(data.content_url);
    }
    return true;
  }, {
    message: t("creator.validation_url_invalid"),
    path: ["content_url"],
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      access_level: "free",
      price_huf: undefined,
      content_url: "",
    },
  });

  const accessLevel = form.watch("access_level");

  // Load existing program data for edit mode
  useEffect(() => {
    if (mode === "edit" && programId && user) {
      loadProgram();
    }
  }, [mode, programId, user]);

  const loadProgram = async () => {
    if (!programId || !user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("expert_contents")
        .select("*")
        .eq("id", programId)
        .eq("creator_id", user.id)
        .single();

      if (error) throw error;
      if (!data) {
        toast.error("Program not found");
        navigate("/creator/dashboard");
        return;
      }

      // Populate form
      form.reset({
        title: data.title,
        description: data.description || "",
        category: "",
        access_level: data.access_level as FormData["access_level"] || "free",
        price_huf: data.price_huf || undefined,
        content_url: data.content_url || "",
      });

      // Set existing state
      setExistingThumbnail(data.thumbnail_url);
      setThumbnailPreview(data.thumbnail_url);
      setRejectionReason(data.rejection_reason);
      setIsFeatured(data.is_featured || false);

      // Determine status
      if (data.rejection_reason) {
        setExistingStatus("rejected");
      } else if (data.is_published) {
        setExistingStatus("published");
      } else if (data.reviewed_at === null) {
        setExistingStatus("pending");
      } else {
        setExistingStatus("draft");
      }
    } catch (error) {
      console.error("Error loading program:", error);
      toast.error("Failed to load program");
      navigate("/creator/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle thumbnail upload
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file?: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("creator.upload_type_error"));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("creator.upload_size_error"));
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }, []);

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setExistingThumbnail(null);
  };

  // Upload thumbnail to storage
  const uploadThumbnail = async (): Promise<string | null> => {
    if (!thumbnailFile || !user) return existingThumbnail;

    const timestamp = Date.now();
    const fileExt = thumbnailFile.name.split(".").pop();
    const filePath = `${user.id}/${timestamp}_${thumbnailFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("expert-content-thumbnails")
      .upload(filePath, thumbnailFile);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(t("creator.upload_error"));
    }

    const { data: urlData } = supabase.storage
      .from("expert-content-thumbnails")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  // Save as draft
  const saveDraft = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSaving(true);
    try {
      const values = form.getValues();
      const thumbnailUrl = await uploadThumbnail();

      if (mode === "create") {
        // Determine access_type based on price
        const priceHuf = values.access_level === "one_time_purchase" ? values.price_huf : 0;
        const accessType = priceHuf && priceHuf > 0 ? 'paid' : 'free';
        
        const { error } = await supabase.from("expert_contents").insert({
          creator_id: user?.id,
          title: values.title,
          description: values.description,
          thumbnail_url: thumbnailUrl,
          content_url: values.content_url || null,
          access_level: values.access_level,
          price_huf: priceHuf || null,
          access_type: accessType,
          is_published: false,
        });

        if (error) throw error;
      } else if (programId) {
        // Determine access_type based on price
        const priceHuf = values.access_level === "one_time_purchase" ? values.price_huf : 0;
        const accessType = priceHuf && priceHuf > 0 ? 'paid' : 'free';
        
        const { error } = await supabase
          .from("expert_contents")
          .update({
            title: values.title,
            description: values.description,
            thumbnail_url: thumbnailUrl,
            content_url: values.content_url || null,
            access_level: values.access_level,
            price_huf: priceHuf || null,
            access_type: accessType,
            // If price is 0, clear sponsored status
            ...((!priceHuf || priceHuf === 0) && { 
              sponsor_id: null, 
              total_licenses: 0, 
              used_licenses: 0 
            }),
            updated_at: new Date().toISOString(),
          })
          .eq("id", programId)
          .eq("creator_id", user?.id);

        if (error) throw error;
      }

      toast.success(t("creator.program_saved"));
      navigate("/creator/dashboard");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save program");
    } finally {
      setIsSaving(false);
    }
  };

  // Submit for review
  const submitForReview = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const values = form.getValues();
      const thumbnailUrl = await uploadThumbnail();

      if (mode === "create") {
        // Determine access_type based on price
        const priceHuf = values.access_level === "one_time_purchase" ? values.price_huf : 0;
        const accessType = priceHuf && priceHuf > 0 ? 'paid' : 'free';
        
        const { error } = await supabase.from("expert_contents").insert({
          creator_id: user?.id,
          title: values.title,
          description: values.description,
          thumbnail_url: thumbnailUrl,
          content_url: values.content_url || null,
          access_level: values.access_level,
          price_huf: priceHuf || null,
          access_type: accessType,
          is_published: false,
          // reviewed_at stays null to indicate pending review
        });

        if (error) throw error;
        toast.success(t("creator.program_submitted"));
      } else if (programId) {
        // Determine access_type based on price
        const priceHuf = values.access_level === "one_time_purchase" ? values.price_huf : 0;
        const accessType = priceHuf && priceHuf > 0 ? 'paid' : 'free';
        
        // For edits, clear rejection if resubmitting
        const updateData: Record<string, unknown> = {
          title: values.title,
          description: values.description,
          thumbnail_url: thumbnailUrl,
          content_url: values.content_url || null,
          access_level: values.access_level,
          price_huf: priceHuf || null,
          access_type: accessType,
          updated_at: new Date().toISOString(),
        };

        // If price is 0, clear sponsored status
        if (!priceHuf || priceHuf === 0) {
          updateData.sponsor_id = null;
          updateData.total_licenses = 0;
          updateData.used_licenses = 0;
        }

        // If was rejected, clear rejection fields for resubmission
        if (existingStatus === "rejected") {
          updateData.rejection_reason = null;
          updateData.rejected_at = null;
          updateData.reviewed_at = null;
          updateData.reviewed_by = null;
        }

        // If was published, will need re-approval
        if (existingStatus === "published") {
          updateData.is_published = false;
          updateData.reviewed_at = null;
          updateData.reviewed_by = null;
        }

        const { error } = await supabase
          .from("expert_contents")
          .update(updateData)
          .eq("id", programId)
          .eq("creator_id", user?.id);

        if (error) throw error;
        toast.success(existingStatus === "rejected" ? t("creator.resubmitted") : t("creator.program_submitted"));
      }

      navigate("/creator/dashboard");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit program");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">{t("creator.status_draft")}</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">{t("creator.status_pending")}</Badge>;
      case "published":
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400">{t("creator.status_published")}</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-500/20 text-red-400">{t("creator.status_rejected")}</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1930] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1930]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-[#00E5FF]" />
              <h1 className="text-2xl font-bold text-white">
                {mode === "create" ? t("creator.program_new") : t("creator.program_edit")}
              </h1>
            </div>
            {existingStatus && (
              <div className="flex items-center gap-2">
                {isFeatured && <Star className="h-4 w-4 text-[#FFD700] fill-[#FFD700]" />}
                {getStatusBadge(existingStatus)}
              </div>
            )}
          </div>

          {/* Published warning */}
          {existingStatus === "published" && (
            <Alert className="bg-orange-500/10 border-orange-500/30 mb-4">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <AlertTitle className="text-orange-400">{t("creator.edit_warning")}</AlertTitle>
            </Alert>
          )}

          {/* Rejection reason */}
          {existingStatus === "rejected" && rejectionReason && (
            <Alert className="bg-red-500/10 border-red-500/30 mb-4">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-400">{t("creator.rejection_reason")}</AlertTitle>
              <AlertDescription className="text-red-300 mt-1">{rejectionReason}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Form */}
        <form className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-[#112240] border-[#1E3A5F]">
            <CardHeader>
              <CardTitle className="text-[#B0C4DE] uppercase text-sm font-medium tracking-wider">
                {t("creator.program_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">{t("creator.program_title")}</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder={t("creator.program_title_placeholder")}
                  maxLength={100}
                  className="bg-[#0A1930] border-border/50 text-white placeholder:text-white/40 focus:border-[#00E5FF] focus:ring-[#00E5FF]/20"
                />
                {form.formState.errors.title && (
                  <p className="text-red-400 text-sm">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">{t("creator.program_description")}</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder={t("creator.program_description_placeholder")}
                  maxLength={2000}
                  rows={6}
                  className="bg-[#0A1930] border-border/50 text-white placeholder:text-white/40 focus:border-[#00E5FF] focus:ring-[#00E5FF]/20 resize-none"
                />
                {form.formState.errors.description && (
                  <p className="text-red-400 text-sm">{form.formState.errors.description.message}</p>
                )}
                <p className="text-xs text-white/40 text-right">
                  {form.watch("description")?.length || 0}/2000
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-white">{t("creator.program_category")}</Label>
                <Input
                  id="category"
                  {...form.register("category")}
                  placeholder={t("creator.program_category_placeholder")}
                  className="bg-[#0A1930] border-border/50 text-white placeholder:text-white/40 focus:border-[#00E5FF] focus:ring-[#00E5FF]/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail */}
          <Card className="bg-[#112240] border-[#1E3A5F]">
            <CardHeader>
              <CardTitle className="text-[#B0C4DE] uppercase text-sm font-medium tracking-wider">
                {t("creator.program_thumbnail")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {thumbnailPreview ? (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-48 object-cover rounded-lg border border-[#1E3A5F]"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeThumbnail}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t("creator.program_thumbnail_remove")}
                  </Button>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? "border-[#00E5FF] bg-[#00E5FF]/10"
                      : "border-[#1E3A5F] hover:border-[#00E5FF]/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <ImageIcon className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">{t("creator.program_thumbnail_drag")}</p>
                  <label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" className="border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF]/10" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {t("creator.program_thumbnail_upload")}
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-white/40 mt-4">JPG, PNG, WebP • Max 2MB</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Access & Pricing */}
          <Card className="bg-[#112240] border-[#1E3A5F]">
            <CardHeader>
              <CardTitle className="text-[#B0C4DE] uppercase text-sm font-medium tracking-wider">
                {t("creator.program_access")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={accessLevel}
                onValueChange={(value) => form.setValue("access_level", value as FormData["access_level"])}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#0A1930]/50 hover:bg-[#0A1930] transition-colors">
                  <RadioGroupItem value="free" id="free" className="border-[#00E5FF] text-[#00E5FF]" />
                  <Label htmlFor="free" className="text-white cursor-pointer flex-1">
                    <span className="font-medium">Ingyenes</span>
                    <span className="text-white/60 text-sm ml-2">- Mindenki számára elérhető</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#0A1930]/50 hover:bg-[#0A1930] transition-colors">
                  <RadioGroupItem value="registered" id="registered" className="border-[#00E5FF] text-[#00E5FF]" />
                  <Label htmlFor="registered" className="text-white cursor-pointer flex-1">
                    <span className="font-medium">Regisztrált</span>
                    <span className="text-white/60 text-sm ml-2">- Bejelentkezés szükséges</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#0A1930]/50 hover:bg-[#0A1930] transition-colors">
                  <RadioGroupItem value="premium" id="premium" className="border-[#00E5FF] text-[#00E5FF]" />
                  <Label htmlFor="premium" className="text-white cursor-pointer flex-1">
                    <span className="font-medium">Prémium</span>
                    <span className="text-white/60 text-sm ml-2">- Előfizetés szükséges</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-[#0A1930]/50 hover:bg-[#0A1930] transition-colors">
                  <RadioGroupItem value="one_time_purchase" id="one_time_purchase" className="border-[#00E5FF] text-[#00E5FF]" />
                  <Label htmlFor="one_time_purchase" className="text-white cursor-pointer flex-1">
                    <span className="font-medium">Egyszeri vásárlás</span>
                    <span className="text-white/60 text-sm ml-2">- Egyedi ár</span>
                  </Label>
                </div>
              </RadioGroup>

              {/* Price input for one_time_purchase */}
              {accessLevel === "one_time_purchase" && (
                <div className="space-y-2 mt-4 pt-4 border-t border-[#1E3A5F]">
                  <Label htmlFor="price" className="text-white flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#00E5FF]" />
                    {t("expert.set_price")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      min={500}
                      step={500}
                      placeholder={t("creator.program_price_placeholder")}
                      {...form.register("price_huf", { valueAsNumber: true })}
                      className="bg-[#0A1930] border-border/50 text-white placeholder:text-white/40 focus:border-[#00E5FF] focus:ring-[#00E5FF]/20 pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      Ft
                    </span>
                  </div>
                  {form.formState.errors.price_huf && (
                    <p className="text-red-400 text-sm">{form.formState.errors.price_huf.message}</p>
                  )}
                  <p className="text-xs text-white/40">{t("expert.price_hint")} {t("expert.earnings_info")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content URL */}
          <Card className="bg-[#112240] border-[#1E3A5F]">
            <CardHeader>
              <CardTitle className="text-[#B0C4DE] uppercase text-sm font-medium tracking-wider flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                {t("creator.program_content_url")}
              </CardTitle>
              <CardDescription className="text-white/60">
                {t("creator.program_content_url_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                id="content_url"
                {...form.register("content_url")}
                placeholder="https://..."
                className="bg-[#0A1930] border-border/50 text-white placeholder:text-white/40 focus:border-[#00E5FF] focus:ring-[#00E5FF]/20"
              />
              {form.formState.errors.content_url && (
                <p className="text-red-400 text-sm">{form.formState.errors.content_url.message}</p>
              )}
              <p className="text-xs text-white/40">{t("creator.program_content_url_helper")}</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-[#1E3A5F] bg-[#112240] hover:bg-[#1E3A5F] text-white"
              onClick={() => navigate("/creator/dashboard")}
            >
              <X className="h-4 w-4 mr-2" />
              {t("creator.cancel")}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF]/10"
              onClick={saveDraft}
              disabled={isSaving || isSubmitting}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t("creator.save_draft")}
            </Button>

            <Button
              type="button"
              className="bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] hover:from-[#00E5FF]/90 hover:to-[#00B8D4]/90 text-[#0A1930] font-semibold flex-1 sm:flex-none"
              onClick={submitForReview}
              disabled={isSaving || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {existingStatus === "rejected" ? t("creator.resubmit") : t("creator.submit_review")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgramEditor;