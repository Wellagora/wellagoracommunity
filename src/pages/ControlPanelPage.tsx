import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  BookOpen,
  Newspaper,
  Calendar,
  ChevronRight,
  Bot,
  ArrowRight,
  Compass,
  Lightbulb,
  HelpCircle,
  Gift,
  PlusCircle,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { hu, de, enUS } from "date-fns/locale";

interface ContentItem {
  id: string;
  title: string;
  image_url: string | null;
  category: string | null;
  creator?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface NewsItem {
  id: string;
  title: string;
  type: 'event' | 'content';
  created_at: string;
  creator?: {
    first_name: string | null;
  } | null;
}

interface SponsorshipItem {
  id: string;
  content_id: string;
  total_licenses: number;
  used_licenses: number;
  is_active: boolean;
  content?: {
    id: string;
    title: string;
    image_url: string | null;
  };
  sponsor?: {
    name: string;
    logo_url: string | null;
  };
}

const ControlPanelPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { t, language } = useLanguage();
  const [loadingData, setLoadingData] = useState(true);
  const [myContents, setMyContents] = useState<ContentItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [mySponsorships, setMySponsorships] = useState<SponsorshipItem[]>([]);

  // Check if user is a supporter (sponsor role)
  const isSponsor = profile?.user_role && ['sponsor', 'business', 'government', 'ngo'].includes(profile.user_role);

  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoadingData(true);

      try {
        // Load user's purchased/sponsored contents
        const { data: accessData } = await supabase
          .from('content_access')
          .select(`
            content_id,
            expert_contents (
              id, 
              title, 
              image_url, 
              category,
              creator_id
            )
          `)
          .eq('user_id', user.id);

        // Get creator info for contents
        if (accessData && accessData.length > 0) {
          const contents: ContentItem[] = [];
          for (const item of accessData) {
            if (item.expert_contents) {
              const content = item.expert_contents as any;
              // Fetch creator info
              const { data: creatorData } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url')
                .eq('id', content.creator_id)
                .single();
              
              contents.push({
                id: content.id,
                title: content.title,
                image_url: content.image_url,
                category: content.category,
                creator: creatorData
              });
            }
          }
          setMyContents(contents);
        }

        // Load sponsor's sponsorships if they are a sponsor
        if (profile?.user_role && ['sponsor', 'business', 'government', 'ngo'].includes(profile.user_role)) {
          const { data: sponsorshipsData } = await supabase
            .from('content_sponsorships')
            .select(`
              id, content_id, total_licenses, used_licenses, is_active,
              content:expert_contents!content_sponsorships_content_id_fkey(id, title, image_url),
              sponsor:sponsors!content_sponsorships_sponsor_id_fkey(name, logo_url)
            `)
            .eq('is_active', true);
            
          if (sponsorshipsData) {
            setMySponsorships(sponsorshipsData as unknown as SponsorshipItem[]);
          }
        }

        // Load news (latest events and contents)
        const { data: events } = await supabase
          .from('events')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        const { data: latestContents } = await supabase
          .from('expert_contents')
          .select('id, title, created_at, creator_id')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(3);

        // Get creator names for contents
        const contentsWithCreators = await Promise.all(
          (latestContents || []).map(async (c) => {
            const { data: creator } = await supabase
              .from('profiles')
              .select('first_name')
              .eq('id', c.creator_id)
              .single();
            return { ...c, type: 'content' as const, creator };
          })
        );

        const combined: NewsItem[] = [
          ...(events || []).map(e => ({ ...e, type: 'event' as const })),
          ...contentsWithCreators,
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

        setNews(combined);
      } catch (error) {
        console.error('Error loading control panel data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (user && !loading) {
      loadData();
    }
  }, [user, loading, profile?.user_role]);

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return t('time.just_now');
    if (diffHours < 24) return t('time.hours_ago').replace('{{count}}', String(diffHours));
    if (diffHours < 48) return t('time.yesterday');
    return t('time.days_ago').replace('{{count}}', String(Math.floor(diffHours / 24)));
  };

  const handleNewsClick = (item: NewsItem) => {
    if (item.type === 'event') {
      navigate(`/esemenyek`);
    } else if (item.type === 'content') {
      navigate(`/muhelytitok/${item.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const firstName = profile?.first_name || t('control_panel.member');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('control_panel.hello')}, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('control_panel.welcome_subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* SPONSOR VIEW: My Sponsorships */}
            {isSponsor ? (
              <section id="my-sponsorships">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Gift className="h-6 w-6 text-primary" />
                      {t('control_panel.my_sponsorships')}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {t('control_panel.my_sponsorships_subtitle')}
                    </p>
                  </div>
                  <Button onClick={() => navigate('/piacer')} className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    {t('control_panel.new_sponsorship')}
                  </Button>
                </div>

                {loadingData ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-64 w-full rounded-xl" />
                    ))}
                  </div>
                ) : mySponsorships.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mySponsorships.map((sponsorship) => {
                      const remaining = sponsorship.total_licenses - (sponsorship.used_licenses || 0);
                      const usedPercent = ((sponsorship.used_licenses || 0) / sponsorship.total_licenses) * 100;
                      return (
                        <Card 
                          key={sponsorship.id} 
                          className="bg-card border-primary/30 overflow-hidden hover:border-primary/50 transition-all group cursor-pointer"
                          onClick={() => navigate(`/muhelytitok/${sponsorship.content_id}`)}
                        >
                          <div className="aspect-video overflow-hidden relative">
                            <img
                              src={sponsorship.content?.image_url || 'https://images.unsplash.com/photo-1518005020251-58296d8f8b4d?w=400&q=80'}
                              alt={sponsorship.content?.title || ''}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                              <Gift className="h-3 w-3 mr-1" />
                              {t('control_panel.active')}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground line-clamp-2 mb-3">
                              {sponsorship.content?.title}
                            </h3>
                            
                            {/* License counter */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('control_panel.licenses_used')}</span>
                                <span className="font-medium">{sponsorship.used_licenses || 0} / {sponsorship.total_licenses}</span>
                              </div>
                              <Progress value={usedPercent} className="h-2" />
                              <p className="text-xs text-primary">
                                {t('control_panel.licenses_remaining').replace('{{count}}', String(remaining))}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="bg-card border-border p-8 text-center">
                    <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold text-lg mb-2">
                      {t('control_panel.no_sponsorships_title')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('control_panel.no_sponsorships_hint')}
                    </p>
                    <Button onClick={() => navigate('/piacer')} className="bg-primary text-primary-foreground">
                      {t('control_panel.start_sponsoring')}
                    </Button>
                  </Card>
                )}
              </section>
            ) : (
              /* MEMBER VIEW: My Workshop Secrets */
              <section id="my-secrets">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <BookOpen className="h-6 w-6 text-primary" />
                      {t('control_panel.my_workshop_secrets')}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {t('control_panel.my_collection_subtitle')}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/piacer')}>
                    {t('control_panel.browse_more')}
                  </Button>
                </div>

                {loadingData ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-64 w-full rounded-xl" />
                    ))}
                  </div>
                ) : myContents.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myContents.map((content) => (
                      <Card 
                        key={content.id} 
                        className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all group cursor-pointer"
                        onClick={() => navigate(`/muhelytitok/${content.id}`)}
                      >
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={content.image_url || 'https://images.unsplash.com/photo-1518005020251-58296d8f8b4d?w=400&q=80'}
                            alt={content.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                            {content.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {content.creator?.first_name} {content.creator?.last_name}
                          </p>
                          <Button
                            variant="outline"
                            className="w-full border-primary/50 text-primary hover:bg-primary/10"
                          >
                            {t('common.view')}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-card border-border p-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold text-lg mb-2">
                      {t('control_panel.empty_collection_title')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('control_panel.empty_collection_hint')}
                    </p>
                    <Button onClick={() => navigate('/piacer')} className="bg-primary text-primary-foreground">
                      {t('control_panel.explore_marketplace')}
                    </Button>
                  </Card>
                )}
              </section>
            )}

            {/* Káli News Section */}
            <section id="kali-news">
              <div className="mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Newspaper className="h-6 w-6 text-accent" />
                  {t('control_panel.kali_news')}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {t('control_panel.kali_news_subtitle')}
                </p>
              </div>

              <Card className="bg-card border-border divide-y divide-border">
                {loadingData ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : news.length > 0 ? (
                  news.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleNewsClick(item)}
                      className="w-full p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors text-left group"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.type === 'event' ? 'bg-purple-500/20' : 'bg-primary/20'
                      }`}>
                        {item.type === 'event' ? (
                          <Calendar className="h-5 w-5 text-purple-500" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.type === 'event' 
                            ? t('news.new_event') 
                            : `${t('news.new_workshop_secret')} ${item.creator?.first_name || ''}`
                          }
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(item.created_at)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    {t('control_panel.no_news')}
                  </div>
                )}
              </Card>
            </section>
          </div>

          {/* Right: WellBot Widget (1/3) */}
          <div className="lg:col-span-1 animate-fade-in">
            <WellBotWidget navigate={navigate} t={t} />
          </div>
        </div>
      </main>
    </div>
  );
};

// WellBot Widget Component
const WellBotWidget = ({ navigate, t }: { navigate: (path: string) => void; t: (key: string) => string }) => {
  const tips = [
    t('wellbot.tip_1'),
    t('wellbot.tip_2'),
    t('wellbot.tip_3'),
    t('wellbot.tip_4'),
    t('wellbot.tip_5'),
  ];
  
  const [dailyTip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);

  return (
    <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border-primary/20 sticky top-24">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          {/* Animated Avatar */}
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <Bot className="h-10 w-10 text-white" />
            </div>
          </div>
          <h3 className="font-bold text-xl mb-1">WellBot</h3>
          <p className="text-sm text-muted-foreground">{t('wellbot.greeting')}</p>
        </div>

        <div className="space-y-2 mb-6">
          {/* Explore Marketplace */}
          <Button 
            variant="outline"
            onClick={() => navigate('/piacer')}
            className="w-full justify-start border-primary/50 text-primary hover:bg-primary/10"
          >
            <Compass className="h-4 w-4 mr-3" />
            {t('wellbot.find_workshop_secret')}
          </Button>
          
          {/* Daily Tip - Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline"
                className="w-full justify-start border-accent/50 text-accent hover:bg-accent/10"
              >
                <Lightbulb className="h-4 w-4 mr-3" />
                {t('wellbot.daily_tip')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-card border-border p-4 w-72">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{dailyTip}</p>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Need Help */}
          <Button 
            variant="outline"
            onClick={() => navigate('/ai-assistant')}
            className="w-full justify-start border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          >
            <HelpCircle className="h-4 w-4 mr-3" />
            {t('wellbot.need_help')}
          </Button>
        </div>

        {/* Main CTA */}
        <Button 
          onClick={() => navigate('/ai-assistant')}
          className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
        >
          {t('wellbot.chat_with_me')}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ControlPanelPage;
