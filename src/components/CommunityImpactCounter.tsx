import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PressableButton } from "@/components/ui/PressableButton";
import { Sparkles, Heart, Users, LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { StaggerContainer, StaggerItem } from "@/components/ui/StaggerAnimation";
import { LiveNotificationFeed } from "@/components/home/LiveNotificationFeed";

// Story card config - only static data, text comes from translations
const STORY_CARD_CONFIG: Array<{
  id: string;
  titleKey: string;
  quoteKey: string;
  authorKey: string;
  roleKey: string;
  avatar: string;
  icon: LucideIcon;
  borderColor: string;
}> = [
  {
    id: 'community',
    titleKey: 'community_pulse.story_active_title',
    quoteKey: 'community_pulse.story_active_quote',
    authorKey: 'community_pulse.story_active_author',
    roleKey: 'community_pulse.story_active_role',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    icon: Users,
    borderColor: 'border-l-black/20',
  },
  {
    id: 'experiences',
    titleKey: 'community_pulse.story_experiences_title',
    quoteKey: 'community_pulse.story_experiences_quote',
    authorKey: 'community_pulse.story_experiences_author',
    roleKey: 'community_pulse.story_experiences_role',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    icon: Sparkles,
    borderColor: 'border-l-black/15',
  },
  {
    id: 'connections',
    titleKey: 'community_pulse.story_connections_title',
    quoteKey: 'community_pulse.story_connections_quote',
    authorKey: 'community_pulse.story_connections_author',
    roleKey: 'community_pulse.story_connections_role',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    icon: Heart,
    borderColor: 'border-l-black/10',
  },
];

export const CommunityImpactCounter = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="py-12 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header - NO colored badges */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-black">
            {t('community_pulse.title')}
          </h2>
          <p className="text-black/50 mt-3">
            {t('community_pulse.subtitle')}
          </p>
        </div>

        {/* Story Cards - Monochrome with left border + Stagger */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {STORY_CARD_CONFIG.map((story) => {
            const author = t(story.authorKey);
            return (
              <StaggerItem key={story.id}>
                <Card className={`bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 border-l-4 ${story.borderColor} hover:shadow-lg transition-shadow`}>
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center mb-4">
                      <story.icon className="w-5 h-5 text-black/70" />
                    </div>
                    <h3 className="font-bold text-black">{t(story.titleKey)}</h3>
                    <p className="text-black/60 mt-2 text-sm italic">
                      "{t(story.quoteKey)}"
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={story.avatar} />
                        <AvatarFallback className="bg-black/10 text-black/70 text-xs">
                          {author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-black">{author}</p>
                        <p className="text-xs text-black/40">{t(story.roleKey)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Live Notification Feed - Animated */}
        <Card className="p-6 bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5">
          <div className="flex items-center gap-2 mb-5">
            {/* Pulsing live indicator - BLACK not green */}
            <div className="relative flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-black" />
              <div className="absolute w-2 h-2 rounded-full bg-black animate-ping" />
            </div>
            <span className="font-semibold text-black">{t('community_pulse.feed_title')}</span>
          </div>
          
          {/* Live animated notification stream */}
          <LiveNotificationFeed />
        </Card>

        {/* CTA */}
        <div className="text-center mt-10">
          <PressableButton asChild size="lg" className="bg-black hover:bg-black/90 text-white px-8">
            <Link to="/auth">
              {t('community_pulse.cta_button')}
            </Link>
          </PressableButton>
        </div>
      </div>
    </section>
  );
};

export default CommunityImpactCounter;
