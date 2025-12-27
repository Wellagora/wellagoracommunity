import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  MessageCircle, 
  Users, 
  Calendar, 
  Target,
  Handshake,
  Globe,
  Trophy,
  Zap,
  BookOpen,
  Flame
} from "lucide-react";

interface CommunityOverviewProps {
  stakeholderCount: number;
  onViewChange: (view: "overview" | "forums" | "partners" | "events") => void;
  onOpenStoryBook: () => void;
}

const CommunityOverview = ({ stakeholderCount, onViewChange, onOpenStoryBook }: CommunityOverviewProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const features = [
    {
      id: "story-book",
      icon: BookOpen,
      color: "from-warning to-accent",
      iconBg: "bg-gradient-to-br from-warning to-accent",
      title: t('unified_hub.story_book_title'),
      description: t('unified_hub.story_book_desc'),
      stats: "12 " + t('unified_hub.stories'),
      action: onOpenStoryBook
    },
    {
      id: "forums",
      icon: MessageCircle,
      color: "from-primary to-secondary",
      iconBg: "bg-gradient-to-br from-primary to-secondary",
      title: t('unified_hub.forums_title'),
      description: t('unified_hub.forums_desc'),
      stats: "1,247 " + t('unified_hub.discussions'),
      action: () => onViewChange("forums")
    },
    {
      id: "partners",
      icon: Handshake,
      color: "from-secondary to-accent",
      iconBg: "bg-gradient-to-br from-secondary to-accent",
      title: t('unified_hub.partners_title'),
      description: t('unified_hub.partners_desc'),
      stats: `${stakeholderCount} ` + t('unified_hub.stakeholders'),
      action: () => onViewChange("partners")
    },
    {
      id: "events",
      icon: Calendar,
      color: "from-accent to-success",
      iconBg: "bg-gradient-to-br from-accent to-success",
      title: t('unified_hub.events_title'),
      description: t('unified_hub.events_desc'),
      stats: "23 " + t('unified_hub.upcoming'),
      action: () => onViewChange("events")
    },
    {
      id: "challenges",
      icon: Target,
      color: "from-primary-dark to-primary",
      iconBg: "bg-gradient-to-br from-primary-dark to-primary",
      title: t('unified_hub.programs_title'),
      description: t('unified_hub.programs_desc'),
      stats: "15 " + t('unified_hub.active'),
      action: () => navigate('/piacer')
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Feature Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card 
              className="group cursor-pointer card-float bg-gradient-to-br from-card via-card to-background border-2 border-border/50 hover:border-primary/40 overflow-hidden relative"
              onClick={feature.action}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              
              <CardContent className="p-8 relative z-10">
                <motion.div 
                  className={`w-20 h-20 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6 shadow-premium relative overflow-hidden`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-white/20 group-hover:animate-pulse"></div>
                  <feature.icon className="w-10 h-10 text-white relative z-10" />
                </motion.div>
                
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground mb-5 text-base leading-relaxed">
                  {feature.description}
                </p>
                
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 group-hover:shadow-glow transition-shadow duration-300">
                  <Zap className="w-4 h-4 mr-1" />
                  {feature.stats}
                </Badge>

                <motion.div 
                  className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${feature.color}`}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.4 }}
                ></motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-success/15 via-success/10 to-success/5 border-2 border-success/30 hover:border-success/50 card-float overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <CardContent className="p-8 flex items-center gap-5 relative z-10">
              <motion.div 
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success to-success-light flex items-center justify-center shadow-eco"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Users className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <div className="text-4xl font-bold text-success mb-1">{stakeholderCount}</div>
                <div className="text-sm text-success-foreground/70 font-medium">{t('unified_hub.active_members')}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-warning/15 via-warning/10 to-warning/5 border-2 border-warning/30 hover:border-warning/50 card-float overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <CardContent className="p-8 flex items-center gap-5 relative z-10">
              <motion.div 
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warning to-yellow-400 flex items-center justify-center shadow-eco"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <div className="text-4xl font-bold text-warning mb-1">2,450</div>
                <div className="text-sm text-warning-foreground/70 font-medium">{t('unified_hub.total_points')}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border-2 border-primary/30 hover:border-primary/50 card-float overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <CardContent className="p-8 flex items-center gap-5 relative z-10">
              <motion.div 
                className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-eco"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Flame className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <div className="text-4xl font-bold text-primary mb-1">156</div>
                <div className="text-sm text-primary-foreground/70 font-medium">{t('unified_hub.active_today')}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card className="bg-gradient-ocean border-0 shadow-float overflow-hidden relative group">
          <div className="absolute inset-0 bg-wave-pattern opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
          
          <CardContent className="p-12 text-center relative z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Globe className="w-20 h-20 mx-auto mb-6 text-white drop-shadow-glow" />
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-lg">
              {t('unified_hub.cta_title')}
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('unified_hub.cta_description')}
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={() => onViewChange("forums")}
                className="bg-white text-primary hover:bg-white/90 shadow-premium hover:shadow-float hover:scale-105 transition-all duration-300 px-8 py-6 text-lg"
              >
                <MessageCircle className="w-6 h-6 mr-2" />
                {t('unified_hub.join_discussion')}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => onViewChange("partners")}
                className="bg-white/15 border-2 border-white/40 text-white hover:bg-white/25 backdrop-blur-md shadow-premium hover:shadow-float hover:scale-105 transition-all duration-300 px-8 py-6 text-lg"
              >
                <Handshake className="w-6 h-6 mr-2" />
                {t('unified_hub.find_partners')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CommunityOverview;
