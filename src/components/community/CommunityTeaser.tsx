import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Star,
  Calendar,
  ArrowRight,
  Sparkles,
  Heart,
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

  const previewStats = [
    { label: t('community.teaser.members'), value: memberCount > 0 ? `${memberCount}` : '—', icon: Users },
    { label: t('community.teaser.experts'), value: expertCount > 0 ? `${expertCount}` : '—', icon: Star },
    { label: t('community.teaser.events_monthly'), value: programCount > 0 ? `${programCount}` : '—', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-background to-amber-50/50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-6">
            <Users className="h-4 w-4 mr-1" />
            {t('community.teaser.badge')}
          </Badge>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground"
          >
            {t('community.teaser.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            {t('community.teaser.subtitle')}
          </motion.p>

          {/* Stats Preview - only show if there are any real stats */}
          {(memberCount > 0 || expertCount > 0 || programCount > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-6 mb-12"
            >
              {previewStats.map((stat, index) => {
                const Icon = stat.icon;
                if (stat.value === '—') return null;
                return (
                  <div key={index} className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-border/50">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Features Preview */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Features List */}
          <Card className="relative overflow-hidden border-border/50 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-foreground">{t('community.teaser.exclusive_features')}</h3>
              </div>

              <div className="space-y-3">
                {[
                  { icon: Users, text: t('community.teaser.feature_experts') },
                  { icon: Calendar, text: t('community.teaser.feature_events') },
                  { icon: Heart, text: t('community.teaser.feature_gallery') },
                  { icon: Star, text: t('community.teaser.feature_ratings') },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-amber-600" />
                      </div>
                      <p className="text-sm text-foreground">{feature.text}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Community Values */}
          <Card className="relative overflow-hidden border-border/50 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold text-foreground">{t('community.teaser.community_values')}</h3>
              </div>

              <div className="space-y-3">
                {[
                  { icon: Sparkles, text: t('community.teaser.value_local') },
                  { icon: Heart, text: t('community.teaser.value_sustainable') },
                  { icon: Star, text: t('community.teaser.value_support') },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-emerald-600" />
                      </div>
                      <p className="text-sm text-foreground">{feature.text}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section — light, modern design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="max-w-2xl mx-auto relative">
            {/* Soft gradient glow behind */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200/40 via-amber-100/30 to-emerald-200/40 rounded-3xl blur-2xl" />

            <Card className="relative bg-white/90 backdrop-blur-sm border border-emerald-200/60 shadow-lg overflow-hidden">
              <CardContent className="p-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-amber-50 flex items-center justify-center">
                  <Users className="h-7 w-7 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-foreground">{t('community.teaser.cta_title')}</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t('community.teaser.cta_description')}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    onClick={() => navigate('/auth?tab=register')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 shadow-md"
                  >
                    {t('community.teaser.cta_register')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/auth')}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    {t('community.teaser.cta_login')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityTeaser;
