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
      color: "from-[hsl(190,70%,50%)] to-[hsl(180,65%,55%)]",
      iconBg: "bg-gradient-to-br from-[hsl(190,70%,50%)] to-[hsl(180,65%,55%)]",
      title: t('unified_hub.forums_title'),
      description: t('unified_hub.forums_desc'),
      stats: "1,247 " + t('unified_hub.discussions'),
      action: () => setActiveView("forums")
    },
    {
      id: "partners",
      icon: Handshake,
      color: "from-[hsl(210,80%,50%)] to-[hsl(200,75%,55%)]",
      iconBg: "bg-gradient-to-br from-[hsl(210,80%,50%)] to-[hsl(200,75%,55%)]",
      title: t('unified_hub.partners_title'),
      description: t('unified_hub.partners_desc'),
      stats: `${stakeholders.length} ` + t('unified_hub.stakeholders'),
      action: () => setActiveView("partners")
    },
    {
      id: "events",
      icon: Calendar,
      color: "from-[hsl(165,70%,55%)] to-[hsl(155,65%,60%)]",
      iconBg: "bg-gradient-to-br from-[hsl(165,70%,55%)] to-[hsl(155,65%,60%)]",
      title: t('unified_hub.events_title'),
      description: t('unified_hub.events_desc'),
      stats: "23 " + t('unified_hub.upcoming'),
      action: () => setActiveView("events")
    },
    {
      id: "challenges",
      icon: Target,
      color: "from-[hsl(240,85%,30%)] to-[hsl(220,75%,40%)]",
      iconBg: "bg-gradient-to-br from-[hsl(240,85%,30%)] to-[hsl(220,75%,40%)]",
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
    <div className="min-h-screen">
      {/* Hero Section with Brand Blue Gradient */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-[hsl(240,90%,20%)] via-[hsl(210,80%,40%)] to-[hsl(190,70%,50%)] text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated background patterns */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[hsl(190,70%,60%)] to-[hsl(165,70%,65%)] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[hsl(200,80%,50%)] to-[hsl(180,70%,60%)] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 sm:py-24">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                {t('unified_hub.title')}
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
            
            <p className="text-xl sm:text-2xl text-cyan-100 mb-8 max-w-2xl mx-auto">
              {t('unified_hub.subtitle')}
            </p>

            {currentProject && (
              <Badge className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 text-lg border-white/30">
                <MapPin className="w-5 h-5 mr-2" />
                {currentProject.region_name}
              </Badge>
            )}

            {/* Search Bar */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t('unified_hub.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-cyan-100 text-lg"
                />
              </div>
            </div>
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
                    className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50 overflow-hidden"
                    onClick={feature.action}
                  >
                    <CardContent className="p-8 relative">
                      {/* Icon Circle */}
                      <div className={`w-16 h-16 rounded-full ${feature.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3 text-foreground">
                        {feature.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                      
                      <Badge variant="secondary" className="bg-muted/50">
                        <Zap className="w-3 h-3 mr-1" />
                        {feature.stats}
                      </Badge>

                      {/* Hover Effect Gradient */}
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-success">{stakeholders.length}</div>
                    <div className="text-sm text-muted-foreground">{t('unified_hub.active_members')}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-warning">2,450</div>
                    <div className="text-sm text-muted-foreground">{t('unified_hub.total_points')}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">156</div>
                    <div className="text-sm text-muted-foreground">{t('unified_hub.active_today')}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-[hsl(210,80%,45%)] via-[hsl(200,75%,50%)] to-[hsl(180,70%,55%)] text-white border-0">
              <CardContent className="p-8 text-center">
                <Globe className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <h2 className="text-2xl font-bold mb-3">{t('unified_hub.cta_title')}</h2>
                <p className="text-cyan-50 mb-6 max-w-2xl mx-auto">
                  {t('unified_hub.cta_description')}
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button size="lg" variant="secondary" onClick={() => setActiveView("forums")}>
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {t('unified_hub.join_discussion')}
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => setActiveView("partners")}>
                    <Handshake className="w-5 h-5 mr-2" />
                    {t('unified_hub.find_partners')}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
