import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Star,
  MessageCircle,
  Calendar,
  Lock,
  ArrowRight,
  Sparkles,
  Heart,
} from "lucide-react";

const CommunityTeaser = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Mock preview data
  const previewStats = [
    { label: t('community.teaser.members'), value: "2,450+", icon: Users },
    { label: t('community.teaser.experts'), value: "85+", icon: Star },
    { label: t('community.teaser.events_monthly'), value: "40+", icon: Calendar },
  ];

  const previewActivities = [
    {
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      name: "Anna M.",
      action: t('community.teaser.activity_joined'),
      time: "2 min",
    },
    {
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      name: "Péter K.",
      action: t('community.teaser.activity_rated'),
      time: "5 min",
    },
    {
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      name: "Eszter T.",
      action: t('community.teaser.activity_shared'),
      time: "12 min",
    },
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

          {/* Stats Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            {previewStats.map((stat, index) => {
              const Icon = stat.icon;
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
        </div>
      </div>

      {/* Preview Content - Blurred/Locked */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Activity Feed Preview */}
          <Card className="relative overflow-hidden border-border/50 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-foreground">{t('community.teaser.live_activity')}</h3>
              </div>
              
              <div className="space-y-4">
                {previewActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback>{activity.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-foreground">{activity.name}</span>
                        <span className="text-muted-foreground"> {activity.action}</span>
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </motion.div>
                ))}
              </div>

              {/* Blur overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" style={{ top: '60%' }} />
            </CardContent>
          </Card>

          {/* Features Preview */}
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
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 border-0 text-white overflow-hidden">
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
              
              <Lock className="h-12 w-12 mx-auto mb-4 text-emerald-400" />
              <h2 className="text-2xl font-bold mb-3">{t('community.teaser.cta_title')}</h2>
              <p className="text-slate-300 mb-6 max-w-md mx-auto">
                {t('community.teaser.cta_description')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  size="lg"
                  onClick={() => navigate('/auth?tab=register')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8"
                >
                  {t('community.teaser.cta_register')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  {t('community.teaser.cta_login')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityTeaser;
