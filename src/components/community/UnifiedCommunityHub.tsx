import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ModernRegionalVisualization from "@/components/matching/ModernRegionalVisualization";
import ForumCard from "./ForumCard";
import { 
  MessageCircle, 
  Users, 
  Calendar, 
  Search,
  Plus,
  Flame,
  Star,
  MapPin,
  Target,
  TrendingUp,
  Building2,
  Handshake,
  Globe,
  Sparkles,
  Trophy,
  Zap
} from "lucide-react";

interface StakeholderProfile {
  id: string;
  name: string;
  type: 'citizen' | 'business' | 'government' | 'ngo';
  organization?: string;
  location: string;
  region: string;
  city?: string;
  district?: string;
  latitude: number;
  longitude: number;
  bio: string;
  sustainability_goals: string[];
  avatar: string;
  impactScore: number;
}

const UnifiedCommunityHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"overview" | "forums" | "partners" | "events">("overview");
  const { t } = useLanguage();
  const { currentProject } = useProject();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stakeholders, setStakeholders] = useState<StakeholderProfile[]>([]);
  const [loadingStakeholders, setLoadingStakeholders] = useState(true);

  // Fetch stakeholders for current project
  useEffect(() => {
    if (!currentProject) {
      setStakeholders([]);
      setLoadingStakeholders(false);
      return;
    }

    const fetchStakeholders = async () => {
      setLoadingStakeholders(true);
      try {
        const { data: members } = await supabase
          .from('project_members')
          .select('user_id')
          .eq('project_id', currentProject.id);

        if (!members || members.length === 0) {
          setStakeholders([]);
          setLoadingStakeholders(false);
          return;
        }

        const memberIds = members.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', memberIds)
          .eq('is_public_profile', true);

        const { data: activities } = await supabase
          .from('sustainability_activities')
          .select('user_id, points_earned')
          .in('user_id', memberIds)
          .eq('project_id', currentProject.id);

        const impactScores: Record<string, number> = {};
        activities?.forEach(activity => {
          impactScores[activity.user_id] = (impactScores[activity.user_id] || 0) + (activity.points_earned || 0);
        });

        const baseCoords = { lat: 46.9, lng: 17.6 };
        const transformedStakeholders: StakeholderProfile[] = (profiles || []).map((profile, index) => {
          const typeMap: Record<string, StakeholderProfile['type']> = {
            'business': 'business',
            'government': 'government',
            'ngo': 'ngo',
            'citizen': 'citizen'
          };

          const lat = profile.latitude ? Number(profile.latitude) : baseCoords.lat + (index * 0.01);
          const lng = profile.longitude ? Number(profile.longitude) : baseCoords.lng + (index * 0.01);

          return {
            id: profile.id,
            name: profile.public_display_name || `${profile.first_name} ${profile.last_name}`,
            type: typeMap[profile.user_role] || 'citizen',
            organization: profile.organization || undefined,
            location: profile.location || currentProject.region_name,
            region: currentProject.region_name,
            city: profile.city || profile.location || currentProject.region_name,
            district: profile.district || profile.city,
            latitude: lat,
            longitude: lng,
            bio: profile.bio || t('regional.no_description'),
            sustainability_goals: profile.sustainability_goals || [],
            avatar: profile.avatar_url || "👤",
            impactScore: impactScores[profile.id] || 0,
          };
        });

        setStakeholders(transformedStakeholders);
      } catch (error) {
        console.error('Error fetching stakeholders:', error);
        setStakeholders([]);
      } finally {
        setLoadingStakeholders(false);
      }
    };

    fetchStakeholders();
  }, [currentProject, t]);

  // Feature cards configuration
  const features = [
    {
      id: "forums",
      icon: MessageCircle,
      color: "from-primary to-secondary",
      iconBg: "bg-gradient-to-br from-primary to-secondary",
      title: t('unified_hub.forums_title'),
      description: t('unified_hub.forums_desc'),
      stats: "1,247 " + t('unified_hub.discussions'),
      action: () => setActiveView("forums")
    },
    {
      id: "partners",
      icon: Handshake,
      color: "from-secondary to-accent",
      iconBg: "bg-gradient-to-br from-secondary to-accent",
      title: t('unified_hub.partners_title'),
      description: t('unified_hub.partners_desc'),
      stats: `${stakeholders.length} ` + t('unified_hub.stakeholders'),
      action: () => setActiveView("partners")
    },
    {
      id: "events",
      icon: Calendar,
      color: "from-accent to-success",
      iconBg: "bg-gradient-to-br from-accent to-success",
      title: t('unified_hub.events_title'),
      description: t('unified_hub.events_desc'),
      stats: "23 " + t('unified_hub.upcoming'),
      action: () => setActiveView("events")
    },
    {
      id: "challenges",
      icon: Target,
      color: "from-primary-dark to-primary",
      iconBg: "bg-gradient-to-br from-primary-dark to-primary",
      title: t('unified_hub.programs_title'),
      description: t('unified_hub.programs_desc'),
      stats: "15 " + t('unified_hub.active'),
      action: () => navigate('/challenges')
    }
  ];

  // Mock forums data
  const forums = [
    {
      id: "general",
      name: t('community.forums.general.name'),
      description: t('community.forums.general.description'),
      category: "General",
      posts: 1247,
      members: 856,
      color: "bg-primary",
      recentPosts: []
    }
  ];

  // Mock events data
  const upcomingEvents = [
    {
      id: "1",
      title: t('community.events.tree_planting.title'),
      date: "March 15, 2024",
      time: "9:00 AM",
      location: t('community.events.tree_planting.location'),
      attendees: 67,
      organizer: t('community.events.tree_planting.organizer')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Dark Hero with Atmospheric Glow */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-hero text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Atmospheric Mountain Mist */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-mountain-mist"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-aqua-glow"></div>
          <div className="absolute inset-0 bg-organic-shapes opacity-60"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-info/12 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.8s' }}></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 sm:py-24">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6 animate-fade-up">
              <motion.div
                animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-accent drop-shadow-glow" />
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold drop-shadow-lg">
                {t('unified_hub.title')}
              </h1>
              <motion.div
                animate={{ rotate: [0, -15, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <Sparkles className="w-8 h-8 text-accent drop-shadow-glow" />
              </motion.div>
            </div>
            
            <p className="text-xl sm:text-2xl text-white/85 mb-8 max-w-2xl mx-auto font-light leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
              {t('unified_hub.subtitle')}
            </p>

            {currentProject && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Badge className="bg-glass-strong text-white px-6 py-3 text-lg border-white/40 shadow-glow">
                  <MapPin className="w-5 h-5 mr-2" />
                  {currentProject.region_name}
                </Badge>
              </motion.div>
            )}

            {/* Beautiful Search Bar */}
            <motion.div 
              className="mt-10 max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="relative group">
                <Search className="absolute left-5 top-5 h-6 w-6 text-white/70 group-hover:text-accent transition-colors duration-300" />
                <Input
                  placeholder={t('unified_hub.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 h-16 bg-glass-strong border-accent/30 text-white placeholder:text-white/60 text-lg rounded-2xl shadow-glow hover:shadow-premium hover:border-accent/50 transition-all duration-300"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {activeView === "overview" && (
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
                    {/* Animated gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${feature.color.replace('from-', 'hsl(').replace('to-', 'hsl(').replace('[', '').replace(']', '')})` }}></div>
                    
                    <CardContent className="p-8 relative z-10">
                      {/* Glowing Icon Circle */}
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

                      {/* Animated Bottom Bar */}
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

            {/* Inspiring Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
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
                      <div className="text-4xl font-bold text-success mb-1">{stakeholders.length}</div>
                      <div className="text-sm text-success-foreground/70 font-medium">{t('unified_hub.active_members')}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
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

            {/* Inspiring Call to Action */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Card className="bg-gradient-ocean border-0 shadow-float overflow-hidden relative group">
                {/* Animated background effect */}
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
                      onClick={() => setActiveView("forums")}
                      className="bg-white text-primary hover:bg-white/90 shadow-premium hover:shadow-float hover:scale-105 transition-all duration-300 px-8 py-6 text-lg"
                    >
                      <MessageCircle className="w-6 h-6 mr-2" />
                      {t('unified_hub.join_discussion')}
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={() => setActiveView("partners")}
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
        )}

        {activeView === "forums" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setActiveView("overview")}>
                ← {t('common.back')}
              </Button>
              <Button className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                {t('community.new_post')}
              </Button>
            </div>
            
            <div className="grid gap-6">
              {forums.map((forum) => (
                <ForumCard 
                  key={forum.id} 
                  forum={forum} 
                  onViewForum={(id) => console.log('View forum:', id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {activeView === "partners" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Button variant="ghost" onClick={() => setActiveView("overview")}>
              ← {t('common.back')}
            </Button>
            
            {loadingStakeholders ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('common.loading')}</p>
              </div>
            ) : stakeholders.length > 0 ? (
              <ModernRegionalVisualization
                stakeholders={stakeholders}
                onStakeholderClick={(stakeholder) => {
                  toast({
                    title: t('regional.stakeholder_selected'),
                    description: stakeholder.name,
                  });
                }}
              />
            ) : (
              <Card className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">{t('regional.no_stakeholders')}</h3>
                <p className="text-muted-foreground">{t('regional.no_stakeholders_desc')}</p>
              </Card>
            )}
          </motion.div>
        )}

        {activeView === "events" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Button variant="ghost" onClick={() => setActiveView("overview")}>
              ← {t('common.back')}
            </Button>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>{t('community.organized_by')} {event.organizer}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{event.date} {t('community.at')} {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{event.attendees} {t('community.attending')}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-primary">
                      {t('community.join_event')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UnifiedCommunityHub;
