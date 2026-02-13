import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  Eye,
  Ticket,
  Wallet,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  LayoutGrid,
  List,
  Filter,
  Leaf,
  Plus,
  Calendar,
  MapPin,
  Users,
  Star,
  Video,
  Monitor,
  UserCheck,
  Tag,
  Share2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";
import { formatPrice } from "@/lib/pricing";
import { ShareToolkit } from "@/components/expert/ShareToolkit";

interface Program {
  id: string;
  title: string;
  image_url: string | null;
  is_published: boolean;
  used_licenses: number;
  total_licenses: number;
  max_capacity: number | null;
  created_at: string;
  event_date: string | null;
  price_huf: number | null;
  category: string | null;
  content_type: string | null;
  region_id: string | null;
  average_rating?: number;
  review_count?: number;
  vouchers_count?: number;
  revenue?: number;
  views_count?: number;
}

interface MyProgramsListProps {
  userId: string;
}

type ViewMode = "grid" | "list";
type FilterMode = "all" | "published" | "drafts" | "completed";

const CATEGORY_LABELS: Record<string, { hu: string; en: string; de: string }> = {
  wellness: { hu: "Wellness", en: "Wellness", de: "Wellness" },
  cooking: { hu: "Főzés", en: "Cooking", de: "Kochen" },
  gardening: { hu: "Kertészet", en: "Gardening", de: "Gärtnern" },
  crafts: { hu: "Kézművesség", en: "Crafts", de: "Handwerk" },
  sustainability: { hu: "Fenntarthatóság", en: "Sustainability", de: "Nachhaltigkeit" },
  health: { hu: "Egészség", en: "Health", de: "Gesundheit" },
  education: { hu: "Oktatás", en: "Education", de: "Bildung" },
  nature: { hu: "Természet", en: "Nature", de: "Natur" },
};

const CONTENT_TYPE_LABELS: Record<string, { hu: string; en: string; de: string; icon: typeof Video }> = {
  recorded: { hu: "Felvett", en: "Recorded", de: "Aufgezeichnet", icon: Video },
  online_live: { hu: "Online élő", en: "Online Live", de: "Online Live", icon: Monitor },
  in_person: { hu: "Személyes", en: "In-Person", de: "Vor Ort", icon: Users },
};

const MyProgramsList = ({ userId }: MyProgramsListProps) => {
  const { t, language } = useLanguage();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareProgram, setShareProgram] = useState<Program | null>(null);

  const dateLocale = language === 'hu' ? hu : language === 'de' ? de : enUS;

  useEffect(() => {
    loadPrograms();
  }, [userId]);

  const loadPrograms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("expert_contents")
        .select(`
          id, title, image_url, is_published, used_licenses, total_licenses, 
          max_capacity, created_at, event_date, price_huf, category, content_type, region_id
        `)
        .eq("creator_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch ratings and stats for each program
      const programsWithStats = await Promise.all(
        (data || []).map(async (program) => {
          // Fetch ratings
          const { data: ratingData } = await supabase
            .rpc('get_content_average_rating', { p_content_id: program.id });
          const { data: countData } = await supabase
            .rpc('get_content_review_count', { p_content_id: program.id });
          
          // Fetch vouchers count (status = 'active')
          const { data: vouchersData } = await supabase
            .from('vouchers')
            .select('id', { count: 'exact', head: true })
            .eq('content_id', program.id)
            .eq('status', 'active');
          
          // Fetch revenue from transactions (status = 'completed')
          const { data: transactionsData } = await supabase
            .from('transactions')
            .select('creator_revenue')
            .eq('content_id', program.id)
            .eq('status', 'completed');
          
          const totalRevenue = transactionsData?.reduce((sum, t) => sum + (t.creator_revenue || 0), 0) || 0;
          
          // Fetch unique participants (vouchers + transactions)
          const { data: voucherUsers } = await supabase
            .from('vouchers')
            .select('user_id')
            .eq('content_id', program.id)
            .eq('status', 'active');
          
          const { data: transactionBuyers } = await supabase
            .from('transactions')
            .select('buyer_id')
            .eq('content_id', program.id)
            .eq('status', 'completed');
          
          const uniqueParticipants = new Set([
            ...(voucherUsers?.map(v => v.user_id) || []),
            ...(transactionBuyers?.map(t => t.buyer_id) || [])
          ]);
          
          return {
            ...program,
            average_rating: ratingData || 0,
            review_count: countData || 0,
            vouchers_count: vouchersData?.length || 0,
            revenue: totalRevenue,
            views_count: uniqueParticipants.size,
          };
        })
      );

      setPrograms(programsWithStats);
    } catch (error) {
      console.error("Error loading programs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPrograms = programs.filter(p => {
    // Status filter
    if (filterMode === "published" && !p.is_published) return false;
    if (filterMode === "drafts" && p.is_published) return false;
    if (filterMode === "completed") {
      // Completed = reached capacity
      const capacity = p.max_capacity || p.total_licenses || 0;
      if (capacity === 0 || (p.used_licenses || 0) < capacity) return false;
    }
    
    // Category filter
    if (categoryFilter && p.category !== categoryFilter) return false;
    
    return true;
  });

  const uniqueCategories = [...new Set(programs.map(p => p.category).filter(Boolean))];

  const getStatusBadge = (program: Program) => {
    const capacity = program.max_capacity || program.total_licenses || 0;
    const used = program.used_licenses || 0;
    
    if (capacity > 0 && used >= capacity) {
      return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20">{t("expert_studio.status_completed") || "Completed"}</Badge>;
    }
    if (program.is_published) {
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{t("expert_studio.status_published")}</Badge>;
    }
    return <Badge variant="secondary">{t("expert_studio.status_draft")}</Badge>;
  };

  const getContentTypeBadge = (contentType: string | null) => {
    const type = contentType || 'in_person';
    const label = CONTENT_TYPE_LABELS[type];
    const Icon = label?.icon || Users;
    const labelText = label ? label[language as 'hu' | 'en' | 'de'] : type;
    
    return (
      <Badge variant="outline" className="gap-1 text-xs">
        <Icon className="w-3 h-3" />
        {labelText}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return null;
    const labels = CATEGORY_LABELS[category];
    return labels?.[language as keyof typeof labels] || category;
  };

  const calculateRevenue = (program: Program) => {
    const pricePerBooking = program.price_huf || 5000;
    const grossRevenue = (program.used_licenses || 0) * pricePerBooking;
    return Math.round(grossRevenue * 0.80);
  };

  const getCapacityInfo = (program: Program) => {
    const capacity = program.max_capacity || program.total_licenses || 0;
    const used = program.used_licenses || 0;
    const percentage = capacity > 0 ? Math.round((used / capacity) * 100) : 0;
    return { used, capacity, percentage };
  };

  const handleDeleteClick = (program: Program) => {
    setProgramToDelete(program);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!programToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("expert_contents")
        .delete()
        .eq("id", programToDelete.id)
        .eq("creator_id", userId);

      if (error) throw error;

      setPrograms(programs.filter(p => p.id !== programToDelete.id));
      toast.success(t("expert_studio.program_deleted") || "Program deleted");
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error(t("expert_studio.delete_error") || "Error deleting program");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProgramToDelete(null);
    }
  };

  const handleDuplicate = async (program: Program) => {
    try {
      const { data: original, error: fetchError } = await supabase
        .from("expert_contents")
        .select("*")
        .eq("id", program.id)
        .single();

      if (fetchError || !original) throw fetchError;

      const { id, created_at, updated_at, used_licenses, reviewed_at, reviewed_by, ...rest } = original;
      
      const { error: insertError } = await supabase
        .from("expert_contents")
        .insert({
          ...rest,
          title: `${original.title} (${t("expert_studio.copy") || "Copy"})`,
          is_published: false,
          used_licenses: 0,
        });

      if (insertError) throw insertError;

      toast.success(t("expert_studio.program_duplicated") || "Program duplicated");
      loadPrograms();
    } catch (error) {
      console.error("Error duplicating program:", error);
      toast.error(t("expert_studio.duplicate_error") || "Error duplicating program");
    }
  };

  const renderRating = (program: Program) => {
    if (!program.review_count || program.review_count === 0) {
      return (
        <span className="text-xs text-muted-foreground">
          {t("expert_studio.no_ratings") || "No ratings"}
        </span>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span className="text-sm font-medium">{program.average_rating?.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">({program.review_count})</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-md border-white/40">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {t("expert_studio.my_programs")}
            </CardTitle>
            <CardDescription>
              {t("expert_studio.my_programs_desc")}
            </CardDescription>
            <p className="text-xs text-muted-foreground mt-2">
              {t("expert_studio.my_programs_monetization_hint")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* New Program Button */}
            <Link to="/szakertoi-studio/uj">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" />
                {t("expert_studio.new_program")}
              </Button>
            </Link>
            <Link to="/community">
              <Button variant="outline" size="sm">
                {t("expert_studio.view_community")}
              </Button>
            </Link>
            <Link to="/programs">
              <Button variant="outline" size="sm">
                {t("expert_studio.see_example_programs")}
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                {filterMode === "all" && (t("expert_studio.filter_all") || "All")}
                {filterMode === "published" && (t("expert_studio.filter_published") || "Published")}
                {filterMode === "drafts" && (t("expert_studio.filter_drafts") || "Drafts")}
                {filterMode === "completed" && (t("expert_studio.filter_completed") || "Completed")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterMode("all")}>
                {t("expert_studio.filter_all") || "All"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterMode("published")}>
                {t("expert_studio.filter_published") || "Published"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterMode("drafts")}>
                {t("expert_studio.filter_drafts") || "Drafts"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterMode("completed")}>
                {t("expert_studio.filter_completed") || "Completed"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          {uniqueCategories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Tag className="w-4 h-4" />
                  {categoryFilter ? getCategoryLabel(categoryFilter) : (t("expert_studio.all_categories") || "All Categories")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
                  {t("expert_studio.all_categories") || "All Categories"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {uniqueCategories.map((cat) => (
                  <DropdownMenuItem key={cat} onClick={() => setCategoryFilter(cat!)}>
                    {getCategoryLabel(cat!)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="flex-1" />

          {/* View Toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredPrograms.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("expert_studio.no_programs_yet")}</h3>
            <p className="text-muted-foreground mb-4">{t("expert_studio.no_programs_hint")}</p>
            <p className="text-xs text-muted-foreground mb-6">
              {t("expert_studio.no_programs_helper")}
            </p>
            <Link to="/szakertoi-studio/uj">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" />
                {t("expert_studio.create_first_program")}
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">{t("expert_studio.create_first_program_hint")}</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredPrograms.map((program, index) => {
                const { used, capacity, percentage } = getCapacityInfo(program);
                return (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-muted relative">
                        {program.image_url ? (
                          <img
                            src={program.image_url}
                            alt={program.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.querySelector('.img-fallback')?.classList.remove('hidden'); }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-emerald-500/10 img-fallback ${program.image_url ? 'hidden' : ''}`}>
                          <Leaf className="w-12 h-12 text-primary/30" />
                        </div>
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          {getStatusBadge(program)}
                          {getContentTypeBadge(program.content_type)}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/expert-studio/${program.id}/edit`}>
                                <Pencil className="w-4 h-4 mr-2" />
                                {t("common.edit")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(program)}>
                              <Copy className="w-4 h-4 mr-2" />
                              {t("expert_studio.duplicate")}
                            </DropdownMenuItem>
                            {program.is_published && (
                              <DropdownMenuItem onClick={() => setShareProgram(program)}>
                                <Share2 className="w-4 h-4 mr-2" />
                                {t("share.share_program")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                              <Link to={`/expert-studio/${program.id}/participants`}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                {t("expert_studio.view_participants")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteClick(program)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t("common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                          {program.title || t("expert_studio.untitled")}
                        </h3>
                        
                        {/* Meta info row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
                          {program.category && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {getCategoryLabel(program.category)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(program.event_date || program.created_at), 'MMM d, yyyy', { locale: dateLocale })}
                          </span>
                          {program.region_id && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {t("expert_studio.local") || "Local"}
                            </span>
                          )}
                        </div>

                        {/* Capacity bar */}
                        {capacity > 0 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {used}/{capacity} {t("expert_studio.participants") || "participants"}
                              </span>
                              <span className="font-medium">{percentage}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Rating */}
                        <div className="mb-3">
                          {renderRating(program)}
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-muted/50 rounded-lg">
                            <Eye className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                            <p className="text-xs text-muted-foreground">{t("expert_studio.views")}</p>
                            <p className="font-semibold text-sm">{program.views_count || 0}</p>
                          </div>
                          <div className="p-2 bg-muted/50 rounded-lg">
                            <Ticket className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                            <p className="text-xs text-muted-foreground">{t("expert_studio.registrations_short") || "Registrations"}</p>
                            <p className="font-semibold text-sm">{program.vouchers_count || 0}</p>
                          </div>
                          <div className="p-2 bg-muted/50 rounded-lg">
                            <Wallet className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                            <p className="text-xs text-muted-foreground">{t("expert_studio.revenue_short")}</p>
                            <p className="font-semibold text-sm text-emerald-600">
                              {formatPrice(program.revenue || 0, 'HUF')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPrograms.map((program) => {
              const { used, capacity, percentage } = getCapacityInfo(program);
              return (
                <div
                  key={program.id}
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="w-20 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {program.image_url ? (
                      <img
                        src={program.image_url}
                        alt={program.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.querySelector('.img-fallback')?.classList.remove('hidden'); }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-emerald-500/10 img-fallback ${program.image_url ? 'hidden' : ''}`}>
                      <Leaf className="w-6 h-6 text-primary/30" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {program.title || t("expert_studio.untitled")}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {getStatusBadge(program)}
                      {getContentTypeBadge(program.content_type)}
                      {program.category && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {getCategoryLabel(program.category)}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(program.event_date || program.created_at), 'MMM d, yyyy', { locale: dateLocale })}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <span className="text-muted-foreground text-xs">{t("expert_studio.participants")}</span>
                      <p className="font-medium">{used}{capacity > 0 ? `/${capacity}` : ''}</p>
                    </div>
                    <div className="text-center">
                      {renderRating(program)}
                    </div>
                    <div className="text-center">
                      <span className="font-medium text-emerald-600">
                        {formatPrice(program.revenue || 0, 'HUF')}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/szakertoi-studio/${program.id}/szerkesztes`}>
                          <Pencil className="w-4 h-4 mr-2" />
                          {t("common.edit")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(program)}>
                        <Copy className="w-4 h-4 mr-2" />
                        {t("expert_studio.duplicate")}
                      </DropdownMenuItem>
                      {program.is_published && (
                        <DropdownMenuItem onClick={() => setShareProgram(program)}>
                          <Share2 className="w-4 h-4 mr-2" />
                          {t("share.share_program")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link to={`/expert-studio/${program.id}/participants`}>
                          <UserCheck className="w-4 h-4 mr-2" />
                          {t("expert_studio.view_participants")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteClick(program)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>

    {/* Share Program Dialog */}
    {shareProgram && (
      <ShareToolkit
        type="program"
        programUrl={`${window.location.origin}/program/${shareProgram.id}`}
        expertName=""
        programTitle={shareProgram.title}
        programDate={shareProgram.event_date ? format(new Date(shareProgram.event_date), 'PPP', { locale: dateLocale }) : undefined}
        programPrice={shareProgram.price_huf ? formatPrice(shareProgram.price_huf, 'HUF') : undefined}
        imageUrl={shareProgram.image_url || undefined}
        onClose={() => setShareProgram(null)}
      />
    )}

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("expert_studio.delete_program_title") || "Delete Program"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("expert_studio.delete_program_confirm")?.replace("{{title}}", programToDelete?.title || "") || 
              `Are you sure you want to delete "${programToDelete?.title}"? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (t("common.deleting") || "Deleting...") : (t("common.delete"))}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default MyProgramsList;