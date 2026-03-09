import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Users,
  Star,
  Calendar,
  ArrowRight,
  Sparkles,
  Heart,
  Leaf,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CommunityTeaser = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Real stats from Supabase
  const [memberCount, setMemberCount] = useState<number>(0);
  const [expertCount, setExpertCount] = useState<number>(0);
  const [programCount, setProgramCount] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [membersRes, expertsRes, programsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_role', 'creator'),
          supabase.from('expert_contents').select('id', { count: 'exact', head: true }).eq('is_published', true),
        ]);
        setMemberCount(membersRes.count || 0);
        setExpertCount(expertsRes.count || 0);
        setProgramCount(programsRes.count || 0);
      } catch {
        // Keep 0 on error
      }
    };
    fetchStats();
  }, []);

  const hasStats = memberCount > 0 || expertCount > 0 || programCount > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-100/30 rounded-full blur-[80px]" />
        </div>

        <div className="relative container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/60 mb-8"
          >
            <Users className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">{t('community.teaser.badge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight"
          >
            {t('community.teaser.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {t('community.teaser.subtitle')}
          </motion.p>

          {/* Stats inline */}
          {hasStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-8 md:gap-12 mb-10"
            >
              {memberCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-xl font-bold text-foreground">{memberCount}</span>
                  <span className="text-sm text-muted-foreground">{t('community.teaser.members')}</span>
                </div>
              )}
              {expertCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Star className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-xl font-bold text-foreground">{expertCount}</span>
                  <span className="text-sm text-muted-foreground">{t('community.teaser.experts')}</span>
                </div>
              )}
              {programCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-teal-600" />
                  </div>
                  <span className="text-xl font-bold text-foreground">{programCount}</span>
                  <span className="text-sm text-muted-foreground">{t('community.teaser.events_monthly')}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* CTA inline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              size="lg"
              onClick={() => navigate('/auth?tab=register')}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 shadow-lg shadow-emerald-600/25"
            >
              {t('community.teaser.cta_register')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/auth')}
              className="rounded-full border-foreground/20 text-foreground hover:bg-foreground/5 font-semibold px-8"
            >
              {t('community.teaser.cta_login')}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Bento Grid Features */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {/* Feature: Experts — spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-2 group relative rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl hover:bg-white/80 hover:border-emerald-200/60 hover:shadow-lg transition-all duration-300 p-6 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-amber-50/0 group-hover:from-emerald-50/40 group-hover:to-amber-50/20 transition-all duration-300 rounded-2xl" />
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-1">{t('community.teaser.exclusive_features')}</h3>
                <p className="text-sm text-muted-foreground">{t('community.teaser.feature_experts')}</p>
              </div>
            </div>
          </motion.div>

          {/* Feature: Events — single col */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="group relative rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl hover:bg-white/80 hover:border-amber-200/60 hover:shadow-lg transition-all duration-300 p-6 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 to-orange-50/0 group-hover:from-amber-50/40 group-hover:to-orange-50/20 transition-all duration-300 rounded-2xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t('community.teaser.feature_events')}</h3>
            </div>
          </motion.div>

          {/* Feature: Gallery — single col */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="group relative rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl hover:bg-white/80 hover:border-rose-200/60 hover:shadow-lg transition-all duration-300 p-6 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/0 to-pink-50/0 group-hover:from-rose-50/40 group-hover:to-pink-50/20 transition-all duration-300 rounded-2xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-3">
                <Heart className="h-6 w-6 text-rose-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t('community.teaser.feature_gallery')}</h3>
            </div>
          </motion.div>

          {/* Feature: Ratings — single col */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="group relative rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl hover:bg-white/80 hover:border-teal-200/60 hover:shadow-lg transition-all duration-300 p-6 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-emerald-50/0 group-hover:from-teal-50/40 group-hover:to-emerald-50/20 transition-all duration-300 rounded-2xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                <Star className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t('community.teaser.feature_ratings')}</h3>
            </div>
          </motion.div>

          {/* Values — spans 2 cols + 1 col */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="group relative rounded-2xl border border-white/40 bg-gradient-to-br from-emerald-50/30 to-white/60 backdrop-blur-xl hover:shadow-lg transition-all duration-300 p-6 overflow-hidden"
          >
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Leaf className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{t('community.teaser.value_sustainable')}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="md:col-span-2 group relative rounded-2xl border border-white/40 bg-gradient-to-br from-amber-50/30 to-white/60 backdrop-blur-xl hover:shadow-lg transition-all duration-300 p-6 overflow-hidden"
          >
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <MessageCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-1">{t('community.teaser.value_support')}</h3>
                <p className="text-sm text-muted-foreground">{t('community.teaser.value_local')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CommunityTeaser;
