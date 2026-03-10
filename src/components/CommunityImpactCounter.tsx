import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Users, LucideIcon, ArrowRight, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { StaggerContainer, StaggerItem } from "@/components/ui/StaggerAnimation";
import { LiveNotificationFeed } from "@/components/home/LiveNotificationFeed";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Value proposition cards - no fake testimonials, real community features
const VALUE_CARD_CONFIG: Array<{
  id: string;
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  borderColor: string;
}> = [
  {
    id: 'community',
    titleKey: 'community_pulse.value_community_title',
    descKey: 'community_pulse.value_community_desc',
    icon: Users,
    borderColor: 'border-l-blue-500/40',
  },
  {
    id: 'experiences',
    titleKey: 'community_pulse.value_experiences_title',
    descKey: 'community_pulse.value_experiences_desc',
    icon: Sparkles,
    borderColor: 'border-l-amber-500/40',
  },
  {
    id: 'connections',
    titleKey: 'community_pulse.value_connections_title',
    descKey: 'community_pulse.value_connections_desc',
    icon: Heart,
    borderColor: 'border-l-rose-400/40',
  },
];

export const CommunityImpactCounter = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Fetch real member count from Supabase
  const { data: realMemberCount } = useQuery({
    queryKey: ['real-member-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      return count || 0;
    },
    staleTime: 10 * 60 * 1000,
  });

  const memberCount = realMemberCount || 0;
  const socialProofText = memberCount > 0
    ? (language === 'hu'
      ? `Csatlakozz közösségünkhöz!`
      : language === 'de'
      ? `Werde Teil unserer Gemeinschaft!`
      : `Join our community!`)
    : '';

  return (
    <section 
      ref={sectionRef} 
      className="py-16 bg-gradient-to-b from-gray-50/80 to-white"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header with animated badge */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Section label */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">
              {language === 'hu' ? 'ÉLŐ KÖZÖSSÉG' : language === 'de' ? 'LIVE COMMUNITY' : 'LIVE COMMUNITY'}
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
            {t('community_pulse.title')}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('community_pulse.subtitle')}
          </p>
        </motion.div>

        {/* Value Proposition Cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {VALUE_CARD_CONFIG.map((card) => (
            <StaggerItem key={card.id}>
              <div className={`h-full group relative rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl hover:bg-white/80 hover:shadow-lg transition-all duration-300 p-6 overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-amber-50/0 group-hover:from-blue-50/40 group-hover:to-amber-50/20 transition-all duration-300 rounded-2xl" />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    card.id === 'community' ? 'bg-blue-50 text-blue-600' :
                    card.id === 'experiences' ? 'bg-amber-50 text-amber-600' :
                    'bg-rose-50 text-rose-500'
                  } group-hover:scale-110 transition-transform`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{t(card.titleKey)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t(card.descKey)}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Live Notification Feed - Enhanced with warm background */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Card variant="glass" className="p-6 md:p-8 rounded-2xl shadow-sm">
            {/* Feed Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {/* Pulsing live indicator - Emerald */}
                <div className="relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">
                    {t('community_pulse.feed_title')}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {language === 'hu' ? 'Valós idejű frissítések' : language === 'de' ? 'Echtzeit-Updates' : 'Real-time updates'}
                  </p>
                </div>
              </div>
              
              {/* Activity indicator */}
              <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                <Zap className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {language === 'hu' ? 'Aktív' : 'Active'}
                </span>
              </div>
            </div>
            
            {/* Live animated notification stream */}
            <LiveNotificationFeed />
          </Card>
        </motion.div>

        {/* CTA - Only show for non-authenticated users */}
        {!user && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {memberCount > 0 && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">{socialProofText}</span>
              </div>
            )}

            <Button
              asChild
              size="lg"
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 text-base font-semibold shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300"
            >
              <Link to="/auth" className="flex items-center gap-2">
                {t('community_pulse.cta_button')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CommunityImpactCounter;