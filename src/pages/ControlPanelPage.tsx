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
import {
  Loader2,
  BookOpen,
  Newspaper,
  Calendar,
  ChevronRight,
  Store,
  Bot,
  ArrowRight,
  Compass,
} from "lucide-react";
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

const ControlPanelPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { t, language } = useLanguage();
  const [loadingData, setLoadingData] = useState(true);
  const [myContents, setMyContents] = useState<ContentItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

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
  }, [user, loading]);

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
            {/* My Workshop Secrets Section */}
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
                          {t('control_panel.open')}
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
            <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border-primary/20 sticky top-24">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="inline-flex p-4 rounded-full bg-primary/20 mb-4 shadow-lg">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-1">WellBot</h3>
                  <p className="text-sm text-muted-foreground">{t('wellbot.greeting')}</p>
                </div>

                <div className="space-y-2 mb-6">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/piacer')}
                    className="w-full justify-start border-primary/50 text-primary hover:bg-primary/10"
                  >
                    <Compass className="h-4 w-4 mr-3" />
                    {t('wellbot.find_workshop_secret')}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const section = document.getElementById('my-secrets');
                      section?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full justify-start border-primary/50 text-primary hover:bg-primary/10"
                  >
                    <BookOpen className="h-4 w-4 mr-3" />
                    {t('wellbot.my_collection')}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const section = document.getElementById('kali-news');
                      section?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full justify-start border-accent/50 text-accent hover:bg-accent/10"
                  >
                    <Newspaper className="h-4 w-4 mr-3" />
                    {t('wellbot.news_from_kali')}
                  </Button>
                </div>

                <Button 
                  onClick={() => navigate('/ai-assistant')}
                  className="w-full"
                >
                  {t('wellbot.full_assistant')}
                  <ArrowRight className="h-4 w-4 ml-2" />
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
