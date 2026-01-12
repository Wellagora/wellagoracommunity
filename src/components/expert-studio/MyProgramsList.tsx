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
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Eye,
  Ticket,
  Wallet,
  MoreVertical,
  Pencil,
  Copy,
  Archive,
  LayoutGrid,
  List,
  Filter,
  Leaf
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Program {
  id: string;
  title: string;
  image_url: string | null;
  is_published: boolean;
  used_licenses: number;
  total_licenses: number;
  created_at: string;
  price_huf: number | null;
}

interface MyProgramsListProps {
  userId: string;
}

type ViewMode = "grid" | "list";
type FilterMode = "all" | "published" | "drafts";

const MyProgramsList = ({ userId }: MyProgramsListProps) => {
  const { t } = useLanguage();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  useEffect(() => {
    loadPrograms();
  }, [userId]);

  const loadPrograms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("expert_contents")
        .select("id, title, image_url, is_published, used_licenses, total_licenses, created_at, price_huf")
        .eq("creator_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error("Error loading programs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPrograms = programs.filter(p => {
    if (filterMode === "published") return p.is_published;
    if (filterMode === "drafts") return !p.is_published;
    return true;
  });

  const getStatusBadge = (program: Program) => {
    if (program.is_published) {
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{t("expert_studio.status_published")}</Badge>;
    }
    return <Badge variant="secondary">{t("expert_studio.status_draft")}</Badge>;
  };

  const calculateRevenue = (program: Program) => {
    return (program.used_licenses || 0) * 500;
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
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {t("expert_studio.my_programs")}
            </CardTitle>
            <CardDescription>
              {t("expert_studio.my_programs_desc")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  {filterMode === "all" && t("expert_studio.filter_all")}
                  {filterMode === "published" && t("expert_studio.filter_published")}
                  {filterMode === "drafts" && t("expert_studio.filter_drafts")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterMode("all")}>
                  {t("expert_studio.filter_all")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterMode("published")}>
                  {t("expert_studio.filter_published")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterMode("drafts")}>
                  {t("expert_studio.filter_drafts")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
            <Link to="/szakertoi-studio/uj">
              <Button className="bg-primary hover:bg-primary/90">
                {t("expert_studio.create_first_program")}
              </Button>
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredPrograms.map((program, index) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-muted relative">
                      {program.image_url ? (
                        <img
                          src={program.image_url}
                          alt={program.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-emerald-500/10">
                          <Leaf className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        {getStatusBadge(program)}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                          >
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
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            {t("expert_studio.duplicate")}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Archive className="w-4 h-4 mr-2" />
                            {t("expert_studio.archive")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3 line-clamp-2">
                        {program.title || t("expert_studio.untitled")}
                      </h3>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-muted/50 rounded-lg">
                          <Eye className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">{t("expert_studio.views")}</p>
                          <p className="font-semibold text-sm">{program.used_licenses || 0}</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg">
                          <Ticket className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                          <p className="text-xs text-muted-foreground">{t("expert_studio.vouchers_short")}</p>
                          <p className="font-semibold text-sm">{program.used_licenses || 0}</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg">
                          <Wallet className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                          <p className="text-xs text-muted-foreground">{t("expert_studio.revenue_short")}</p>
                          <p className="font-semibold text-sm text-emerald-600">
                            {calculateRevenue(program).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {program.image_url ? (
                    <img
                      src={program.image_url}
                      alt={program.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-emerald-500/10">
                      <Leaf className="w-6 h-6 text-primary/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {program.title || t("expert_studio.untitled")}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    {getStatusBadge(program)}
                    <span className="text-sm text-muted-foreground">
                      {program.used_licenses || 0} {t("expert_studio.redemptions")}
                    </span>
                    <span className="text-sm font-medium text-emerald-600">
                      {calculateRevenue(program).toLocaleString()} Ft
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
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      {t("expert_studio.duplicate")}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Archive className="w-4 h-4 mr-2" />
                      {t("expert_studio.archive")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyProgramsList;
