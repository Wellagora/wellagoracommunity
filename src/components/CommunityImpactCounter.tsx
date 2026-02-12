import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { PressableButton } from "@/components/ui/PressableButton";
import { TrendingUp, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { LiveNotificationFeed } from "@/components/home/LiveNotificationFeed";

export const CommunityImpactCounter = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [memberCount, setMemberCount] = useState<number>(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      setMemberCount(count || 0);
    };
    fetchCount();
  }, []);

  const socialProofText = memberCount >= 50
    ? t('home.join_members_title').replace('{{count}}', memberCount.toLocaleString())
    : t('home.founding_title');

  const socialProofSubtext = memberCount >= 50
    ? t('home.join_members_subtitle')
    : t('home.founding_subtitle');

  return (
    <section 
      ref={sectionRef} 
      className="py-16 bg-gradient-to-b from-white via-amber-50/30 to-white"
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
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
              {language === 'hu' ? 'ÉLŐ KÖZÖSSÉG' : language === 'de' ? 'LIVE COMMUNITY' : 'LIVE COMMUNITY'}
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">
            {t('community_pulse.title')}
          </h2>
          <p className="text-black/50 max-w-xl mx-auto">
            {t('community_pulse.subtitle')}
          </p>
        </motion.div>

        {/* Live Notification Feed - Enhanced with warm background */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Card className="p-6 md:p-8 bg-white/95 backdrop-blur-xl border-[0.5px] border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
            {/* Feed Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {/* Pulsing live indicator - Emerald */}
                <div className="relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div>
                  <span className="font-semibold text-black">
                    {t('community_pulse.feed_title')}
                  </span>
                  <p className="text-xs text-black/40">
                    {language === 'hu' ? 'Valós idejű frissítések' : language === 'de' ? 'Echtzeit-Updates' : 'Real-time updates'}
                  </p>
                </div>
              </div>
              
              {/* Activity indicator */}
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
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

        {/* CTA with Social Proof - Only show for non-authenticated users */}
        {!user && (
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Social proof badge */}
            {socialProofText && (
              <div className="text-center mb-4">
                <span className="text-sm text-black/60 font-medium block">{socialProofText}</span>
                <span className="text-xs text-black/40 block mt-1">{socialProofSubtext}</span>
              </div>
            )}
            
            {/* CTA Button with glow effect */}
            <div className="relative inline-block">
              {/* Subtle glow behind button */}
              <div className="absolute inset-0 bg-black/20 blur-xl rounded-full scale-75 opacity-50" />
              
              <PressableButton 
                asChild 
                size="lg" 
                className="relative bg-black hover:bg-black/90 text-white px-10 py-6 text-base font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300"
              >
                <Link to="/auth" className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t('community_pulse.cta_button')}
                </Link>
              </PressableButton>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CommunityImpactCounter;