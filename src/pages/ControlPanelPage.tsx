import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
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

// Loading skeleton component
const ControlPanelSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-48" />
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Content section skeleton */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          </div>
          
          {/* News section skeleton */}
          <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar skeleton */}
        <div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    </main>
  </div>
);

const ControlPanelPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { t, language } = useLanguage();
  const [loadingData, setLoadingData] = useState(true);
  const [myContents, setMyContents] = useState<ContentItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [mySponsorships, setMySponsorships] = useState<SponsorshipItem[]>([]);

  // Determine if user is sponsor based on user_role
  const userRole = profile?.user_role || 'member';
  const isSponsor = ['sponsor', 'business', 'government', 'ngo'].includes(userRole);

  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

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

        // Load sponsor's sponsorships if they are viewing as sponsor
        if (isSponsor) {
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
  }, [user, loading, isSponsor]);

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
      navigate(`/events`);
    } else if (item.type === 'content') {
      navigate(`/muhelytitok/${item.id}`);
    }
  };

  // Show skeleton while auth is loading - prevents flicker!
  if (loading) {
    return <ControlPanelSkeleton />;
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
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
                        <p className="text-xs text-muted-foreground">
                          {item.type === 'content' && item.creator?.first_name && (
                            <span>{item.creator.first_name} • </span>
                          )}
                          {getTimeAgo(item.created_at)}
                        </p>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
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
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">WellBot</h3>
                    <p className="text-xs text-muted-foreground">{t('control_panel.wellbot_subtitle')}</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {t('control_panel.wellbot_description')}
                </p>
                
                <div className="space-y-2 mb-4">
                  <button 
                    onClick={() => navigate('/piacer')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors text-left"
                  >
                    <Compass className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{t('control_panel.explore_marketplace')}</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                  </button>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors text-left">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        <span className="text-sm font-medium">{t('control_panel.daily_tip')}</span>
                        <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">{t('control_panel.tip_title')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('control_panel.tip_content')}
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <button 
                    onClick={() => navigate('/help')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors text-left"
                  >
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">{t('control_panel.help')}</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                  </button>
                </div>
                
                <Button 
                  onClick={() => navigate('/ai-assistant')}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  {t('control_panel.chat_with_wellbot')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ControlPanelPage;
