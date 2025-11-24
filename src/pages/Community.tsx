import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Card3D, FeatureCard3D } from "@/components/ui/card-3d";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  MessageCircle, 
  Heart,
  Share2,
  Trophy,
  Target,
  Leaf,
  Building2,
  MapPin,
  User,
  TrendingUp,
  Award,
  Star,
  Send,
  Search,
  Filter,
  Loader2,
  Calendar,
  Eye,
  ThumbsUp
} from "lucide-react";

const Community = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("discussions");
  const [newPost, setNewPost] = useState("");
  const textareaRef = useState<HTMLTextAreaElement | null>(null)[0];

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-foreground">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 lg:py-20 bg-card/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-up-3d">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6">
              {t('nav.community')}
            </h1>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('community.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Community Tabs */}
            <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-3 sm:p-4 lg:p-6">
              <div className="flex space-x-2 mb-4 sm:mb-6">
                <Button
                  variant={activeTab === "discussions" ? "default" : "outline"}
                  onClick={() => setActiveTab("discussions")}
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4"
                >
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{t('community.tabs.discussions')}</span>
                </Button>
                <Button
                  variant={activeTab === "stories" ? "default" : "outline"}
                  onClick={() => setActiveTab("stories")}
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4"
                >
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t('community.tabs.success_stories')}</span>
                  <span className="sm:hidden">{t('community.tabs.stories_short') || 'Erfolge'}</span>
                </Button>
              </div>

              {/* New Post Input */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-background/50 rounded-xl sm:rounded-2xl border border-border/50">
                <Textarea
                  ref={(el) => (textareaRef as any) = el}
                  placeholder={t('community.share_thoughts')}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="mb-3 bg-transparent border-none resize-none text-sm sm:text-base"
                  rows={3}
                />
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                      📷 <span className="hidden sm:inline ml-1">{t('community.image')}</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                      📊 <span className="hidden sm:inline ml-1">{t('community.result')}</span>
                    </Button>
                  </div>
                  <Button className="bg-gradient-to-r from-primary to-success w-full sm:w-auto text-xs sm:text-sm">
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t('community.send')}
                  </Button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "discussions" && (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('community.no_discussions')}</p>
                </div>
              )}

              {activeTab === "stories" && (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('community.no_stories')}</p>
                </div>
              )}
            </Card3D>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Quick Actions */}
            <Card3D className="bg-card/50 backdrop-blur-sm border border-border/50 p-4 sm:p-5 lg:p-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-4 sm:mb-5 lg:mb-6">{t('community.quick_actions')}</h2>
              <div className="space-y-2 sm:space-y-3">
                <Button 
                  onClick={() => {
                    setActiveTab("discussions");
                    setTimeout(() => {
                      (textareaRef as any)?.focus();
                    }, 100);
                  }}
                  className="w-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground shadow-premium hover:shadow-glow transition-all duration-300 text-xs sm:text-sm"
                >
                  {t('community.start_discussion')}
                </Button>
                <Button 
                  onClick={() => setActiveTab("stories")}
                  variant="outline" 
                  className="w-full border-border/50 hover:bg-card/50 text-xs sm:text-sm"
                >
                  {t('community.share_success')}
                </Button>
                <Button 
                  onClick={() => navigate("/explore-region")}
                  variant="outline" 
                  className="w-full border-border/50 hover:bg-card/50 text-xs sm:text-sm"
                >
                  {t('community.find_groups')}
                </Button>
              </div>
            </Card3D>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;