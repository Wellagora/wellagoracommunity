import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bookmark, 
  PlayCircle, 
  ArrowRight, 
  BookOpen,
  Crown,
  ShoppingCart,
  Store
} from "lucide-react";
import { motion } from "framer-motion";

const MyLearningPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Fetch user's accessible programs
  const { data: myPrograms, isLoading } = useQuery({
    queryKey: ["myLearning", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get content IDs from content_access table
      const { data: accessRecords, error: accessError } = await supabase
        .from("content_access")
        .select("content_id, purchased_at")
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false });

      if (accessError) throw accessError;
      if (!accessRecords || accessRecords.length === 0) return [];

      const contentIds = accessRecords.map((r) => r.content_id);

      // Get the programs
      const { data: programs, error: programsError } = await supabase
        .from("expert_contents")
        .select(`
          *,
          creator:profiles!expert_contents_creator_id_fkey (
            id, first_name, last_name, avatar_url
          )
        `)
        .in("id", contentIds)
        .eq("is_published", true);

      if (programsError) throw programsError;

      // Merge with access data
      return programs?.map((program) => {
        const accessRecord = accessRecords.find((r) => r.content_id === program.id);
        return {
          ...program,
          purchased_at: accessRecord?.purchased_at,
        };
      }) || [];
    },
    enabled: !!user,
  });

  // Also get programs user has access to via premium or free/registered
  const { data: freePrograms } = useQuery({
    queryKey: ["myLearningFree", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get free and registered programs
      const { data, error } = await supabase
        .from("expert_contents")
        .select(`
          *,
          creator:profiles!expert_contents_creator_id_fkey (
            id, first_name, last_name, avatar_url
          )
        `)
        .eq("is_published", true)
        .in("access_level", ["free", "registered"]);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const allPrograms = [
    ...(myPrograms || []),
    ...(freePrograms?.filter(
      (fp) => !myPrograms?.some((mp) => mp.id === fp.id)
    ) || []),
  ];

  const getAccessBadge = (accessLevel: string | null) => {
    switch (accessLevel) {
      case "free":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            {t("program.free_access")}
          </Badge>
        );
      case "registered":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {t("common.registered")}
          </Badge>
        );
      case "premium":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        );
      case "one_time_purchase":
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <ShoppingCart className="w-3 h-3 mr-1" />
            {t("learning.purchased")}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A1930] flex items-center justify-center">
        <div className="text-center">
          <Bookmark className="w-16 h-16 text-[hsl(var(--cyan))] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t("learning.login_required")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("learning.login_required_description")}
          </p>
          <Button onClick={() => navigate("/auth")}>
            {t("nav.sign_in")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1930]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--cyan))]/20 flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-[hsl(var(--cyan))]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t("my_agora.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("my_agora.subtitle")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-[#112240] border-[hsl(var(--cyan))]/10">
                <CardContent className="p-0">
                  <Skeleton className="aspect-video w-full rounded-t-lg" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : allPrograms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t("my_agora.empty")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("my_agora.browse")}
            </p>
            <Button onClick={() => navigate("/piactr")} variant="outline">
              <Store className="w-4 h-4 mr-2" />
              {t("nav.marketplace")}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {allPrograms.map((program, index) => {
              const creator = program.creator as {
                id: string;
                first_name: string;
                last_name: string;
                avatar_url: string | null;
              } | null;

              return (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-[#112240] border-[hsl(var(--cyan))]/10 hover:border-[hsl(var(--cyan))]/30 transition-all duration-300 group overflow-hidden">
                    <CardContent className="p-0">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gradient-to-br from-[hsl(var(--cyan))]/10 to-[hsl(var(--primary))]/10 relative overflow-hidden">
                        {program.thumbnail_url ? (
                          <img
                            src={program.thumbnail_url}
                            alt={program.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Bookmark className="w-12 h-12 text-[hsl(var(--cyan))]/30" />
                          </div>
                        )}

                        {/* Play overlay */}
                        <Link
                          to={`/piactr/${program.id}/learn`}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <div className="w-16 h-16 rounded-full bg-[hsl(var(--cyan))] flex items-center justify-center">
                            <PlayCircle className="w-8 h-8 text-white" />
                          </div>
                        </Link>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
                            {program.title}
                          </h3>
                          {getAccessBadge(program.access_level)}
                        </div>

                        {creator && (
                          <Link to={`/szakertok/${creator.id}`} className="text-sm text-muted-foreground hover:text-[hsl(var(--cyan))] transition-colors mb-4 block">
                            {t("program.by_creator")} {creator.first_name}{" "}
                            {creator.last_name}
                          </Link>
                        )}

                        <Link to={`/piactr/${program.id}/learn`}>
                          <Button
                            variant="outline"
                            className="w-full border-[hsl(var(--cyan))]/30 text-[hsl(var(--cyan))] hover:bg-[hsl(var(--cyan))]/10"
                          >
                            {t("my_agora.continue")}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyLearningPage;
