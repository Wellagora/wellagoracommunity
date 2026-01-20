import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Trophy,
  Camera,
  Star,
  MessageCircle,
  HelpCircle,
  Building2,
  ExternalLink,
  Upload,
  X,
  Loader2,
  Share,
  Rss,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import ExpertProfileModal from "@/components/creator/ExpertProfileModal";
import SocialFeed from "./SocialFeed";
import CommunityStatsSection from "./CommunityStatsSection";
import FeaturedExpertSection from "./FeaturedExpertSection";
import CommunityCalendarPreview from "./CommunityCalendarPreview";

interface Creation {
  id: string;
  image_url: string;
  caption: string | null;
  rating: number | null;
  created_at: string;
  user_id?: string;
  user?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
  content?: {
    id: string;
    title: string;
    creator_id?: string;
  } | null;
}

interface Question {
  id: string;
  question: string;
  created_at: string;
  user?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
  content?: {
    id: string;
    title: string;
    creator_id?: string;
  } | null;
  answers?: {
    id: string;
    answer: string;
    created_at: string;
    expert_id?: string;
    expert?: {
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    } | null;
  }[];
}

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  category: string | null;
}

const CommunityHubNew = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Hero header */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-card/95 to-background/95 backdrop-blur-sm py-8 border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-black/10 text-black border-black/20 mb-4">
            <Users className="h-4 w-4 mr-1" />
            {t('community.badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {t('community.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('community.subtitle')}
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4">
        <CommunityStatsSection />
      </div>

      {/* Featured Expert */}
      <div className="container mx-auto px-4">
        <FeaturedExpertSection />
      </div>

      {/* Tabs Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="feed" className="gap-2">
              <Rss className="w-4 h-4" />
              {t('community.tab_feed') || 'Fal'}
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              {t('community.tab_gallery') || 'Galéria'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-0">
            <SocialFeed />
          </TabsContent>

          <TabsContent value="gallery" className="mt-0 space-y-16">
            {/* Section A: Gallery */}
            <CreationsGallerySection />

            {/* Section B: Q&A */}
            <QASection />

            {/* Section C: Local Partners */}
            <LocalPartnersSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* Upcoming Events Preview */}
      <div className="container mx-auto px-4">
        <CommunityCalendarPreview />
      </div>

      {/* Join CTA (non-overlapping; stays in flow) */}
      <div className="container mx-auto px-4 pb-12">
        <div className="mt-12 flex justify-center">
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group relative px-6 py-4 rounded-2xl bg-black text-white font-semibold shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)] transition-shadow"
          >
            <span className="relative flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('community.join_movement')}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CREATIONS GALLERY SECTION
// ============================================

const CreationsGallerySection = () => {
  const { t } = useLanguage();
  const { user, isDemoMode } = useAuth();
  const [creations, setCreations] = useState<Creation[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Demo mode mock creations
  const DEMO_CREATIONS: Creation[] = [
    {
      id: 'demo-creation-1',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop',
      caption: 'Első kovászkenyerem a kemencében! Köszönöm a szakértői tippeket!',
      rating: 5,
      created_at: '2026-01-10T10:00:00Z',
      user: { first_name: 'Tóth', last_name: 'Eszter', avatar_url: null },
      content: { id: 'mock-program-2', title: 'Kovászkenyér kurzus' }
    },
    {
      id: 'demo-creation-2',
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
      caption: 'A gyógynövény túra után elkészítettem a saját kertemet.',
      rating: 5,
      created_at: '2026-01-08T14:00:00Z',
      user: { first_name: 'Molnár', last_name: 'Gábor', avatar_url: null },
      content: { id: 'mock-program-3', title: 'Gyógynövénygyűjtés túra' }
    },
    {
      id: 'demo-creation-3',
      image_url: 'https://images.unsplash.com/photo-1597225244660-1cd128c64284?w=600&h=400&fit=crop',
      caption: 'Házi lekvár nagymamám receptje szerint, de modern csavarral!',
      rating: 4,
      created_at: '2026-01-05T09:30:00Z',
      user: { first_name: 'Fekete', last_name: 'Anna', avatar_url: null },
      content: null
    },
    {
      id: 'demo-creation-4',
      image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=400&fit=crop',
      caption: 'A kosárfonás workshopról hazavitt technikával készült tároló.',
      rating: 5,
      created_at: '2026-01-03T11:00:00Z',
      user: { first_name: 'Varga', last_name: 'Zoltán', avatar_url: null },
      content: { id: 'mock-program-7', title: 'Kosárfonás alapjai' }
    },
    {
      id: 'demo-creation-5',
      image_url: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b4?w=600&h=400&fit=crop',
      caption: 'Méhviaszgyertya a méhészeti programon tanult technikával!',
      rating: 5,
      created_at: '2025-12-28T16:00:00Z',
      user: { first_name: 'Kiss', last_name: 'Judit', avatar_url: null },
      content: { id: 'mock-program-9', title: 'Méhészkedés alapjai' }
    },
    {
      id: 'demo-creation-6',
      image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&h=400&fit=crop',
      caption: 'Fantasztikus nap volt a szőlőben! A must íze felejthetetlenül friss.',
      rating: 5,
      created_at: '2025-12-20T12:00:00Z',
      user: { first_name: 'Horváth', last_name: 'Péter', avatar_url: null },
      content: { id: 'mock-program-6', title: 'Szüret a szőlőben' }
    }
  ];

  const loadCreations = async () => {
    setIsLoading(true);
    
    // In demo mode, use mock data
    if (isDemoMode) {
      setCreations(DEMO_CREATIONS);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('community_creations')
        .select(`
          id,
          image_url,
          caption,
          rating,
          created_at,
          user_id,
          content_id
        `)
        .order('created_at', { ascending: false })
        .limit(12);

      if (data) {
        // Fetch user and content info separately
        const creationsWithDetails = await Promise.all(
          data.map(async (creation) => {
            const [userRes, contentRes] = await Promise.all([
              supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url')
                .eq('id', creation.user_id)
                .single(),
              creation.content_id
                ? supabase
                    .from('expert_contents')
                    .select('id, title')
                    .eq('id', creation.content_id)
                    .single()
                : Promise.resolve({ data: null }),
            ]);

            return {
              ...creation,
              user: userRes.data,
              content: contentRes.data,
            };
          })
        );
        setCreations(creationsWithDetails);
      }
    } catch (error) {
      console.error('Error loading creations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCreations();
  }, [isDemoMode]);

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-green-500" />
            </div>
            {t('community.gallery_title')}
          </h2>
          <p className="text-muted-foreground mt-2">
            {t('community.gallery_subtitle')}
          </p>
        </div>

        {user && (
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-gradient-to-r from-primary to-primary/80"
            size="lg"
          >
            <Camera className="h-5 w-5 mr-2" />
            {t('community.share_creation')}
          </Button>
        )}
      </div>

      {/* Pinterest-style Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : creations.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {creations.map((creation) => (
            <CreationCard key={creation.id} creation={creation} />
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border p-12 text-center">
          <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            {t('community.gallery_empty_title')}
          </h3>
          <p className="text-muted-foreground mb-6">
            {t('community.gallery_empty_hint')}
          </p>
          {user && (
            <Button onClick={() => setIsUploadModalOpen(true)}>
              {t('community.be_first')}
            </Button>
          )}
        </Card>
      )}

      {/* Upload Modal */}
      <CreationUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          setIsUploadModalOpen(false);
          loadCreations();
        }}
      />
    </section>
  );
};

const CreationCard = ({ creation }: { creation: Creation }) => {
  const { t } = useLanguage();

  return (
    <Card className="bg-card border-border overflow-hidden break-inside-avoid hover:border-primary/50 transition-all group">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={creation.image_url}
          alt={creation.caption || 'Alkotás'}
          className="w-full object-cover group-hover:scale-105 transition-transform"
        />

        {/* Rating badge */}
        {creation.rating && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-accent/90 rounded-full flex items-center gap-1">
            <Star className="h-3 w-3 text-accent-foreground fill-accent-foreground" />
            <span className="text-xs font-bold text-accent-foreground">{creation.rating}</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Caption */}
        {creation.caption && (
          <p className="text-sm text-foreground mb-3">{creation.caption}</p>
        )}

        {/* Creator + Workshop Secret */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={creation.user?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {creation.user?.first_name?.[0]}{creation.user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {creation.user?.first_name} {creation.user?.last_name}
            </p>
            {creation.content && (
              <p className="text-xs text-muted-foreground truncate">
                {t('community.based_on')} {creation.content.title}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// CREATION UPLOAD MODAL
// ============================================

const CreationUploadModal = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    image_url: '',
    caption: '',
    content_id: '',
    rating: 0,
  });
  const [myContents, setMyContents] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    const loadMyContents = async () => {
      if (!user || !isOpen) return;

      const { data } = await supabase
        .from('content_access')
        .select('content_id')
        .eq('user_id', user.id);

      if (data && data.length > 0) {
        const contentIds = data.map((d) => d.content_id);
        const { data: contents } = await supabase
          .from('expert_contents')
          .select('id, title')
          .in('id', contentIds);

        setMyContents(contents || []);
      }
    };

    loadMyContents();
  }, [user, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('community.image_too_large'));
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/creation-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('community-creations')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('community-creations')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: urlData.publicUrl });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('community.upload_error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.image_url || !user) {
      toast.error(t('community.image_required'));
      return;
    }

    setIsUploading(true);
    try {
      const { error: creationError } = await supabase
        .from('community_creations')
        .insert({
          user_id: user.id,
          content_id: formData.content_id || null,
          image_url: formData.image_url,
          caption: formData.caption || null,
          rating: formData.rating > 0 ? formData.rating : null,
        });

      if (creationError) throw creationError;

      // If rating provided and content selected, also save to content_reviews
      if (formData.rating > 0 && formData.content_id) {
        await supabase
          .from('content_reviews')
          .upsert(
            {
              user_id: user.id,
              content_id: formData.content_id,
              rating: formData.rating,
            },
            { onConflict: 'user_id,content_id' }
          );
      }

      toast.success(t('community.creation_shared'));
      setFormData({ image_url: '', caption: '', content_id: '', rating: 0 });
      onSuccess();
    } catch (error) {
      console.error('Share error:', error);
      toast.error(t('community.share_error'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            {t('community.share_your_creation')}
          </DialogTitle>
          <DialogDescription>
            {t('community.share_modal_subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image upload */}
          <div className="space-y-2">
            <Label>{t('community.photo_label')} *</Label>
            {formData.image_url ? (
              <div className="relative">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setFormData({ ...formData, image_url: '' })}
                  className="absolute top-2 right-2 p-1 bg-destructive/80 rounded-full"
                >
                  <X className="h-4 w-4 text-destructive-foreground" />
                </button>
              </div>
            ) : (
              <label className="block">
                <div className="h-48 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {t('community.click_to_upload')}
                      </span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}
          </div>

          {/* Workshop Secret selector */}
          <div className="space-y-2">
            <Label>{t('community.based_on_which')}</Label>
            <Select
              value={formData.content_id}
              onValueChange={(value) => setFormData({ ...formData, content_id: value })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder={t('community.select_workshop_secret')} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {myContents.map((content) => (
                  <SelectItem key={content.id} value={content.id}>
                    {content.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Star rating - only if content selected */}
          {formData.content_id && (
            <div className="space-y-2">
              <Label>{t('community.rate_workshop_secret')}</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= formData.rating
                          ? 'text-accent fill-accent'
                          : 'text-border'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.rating > 0
                  ? t('community.rating_selected').replace('{{count}}', String(formData.rating))
                  : t('community.rating_hint')}
              </p>
            </div>
          )}

          {/* Caption */}
          <div className="space-y-2">
            <Label>{t('community.caption_label')}</Label>
            <Textarea
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder={t('community.caption_placeholder')}
              className="bg-background border-border"
              maxLength={280}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.image_url || isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Share className="h-4 w-4 mr-2" />
            )}
            {t('community.share')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// Q&A SECTION
// ============================================

const QASection = () => {
  const { t, language } = useLanguage();
  const { user, isDemoMode } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Import mock Q&A data
  const loadQuestions = async () => {
    setIsLoading(true);
    
    // Use mock data in demo mode
    if (isDemoMode) {
      // Import dynamically to avoid circular dependency
      const { MOCK_QA, getLocalizedQuestion, getLocalizedAnswer } = await import('@/data/mockData');
      const demoQuestions: Question[] = MOCK_QA.map((q) => ({
        id: q.id,
        question: language === 'en' ? q.question_en : language === 'de' ? q.question_de : q.question,
        created_at: q.created_at,
        user: q.user,
        content: q.content ? {
          id: q.content.id,
          title: language === 'en' ? q.content.title_en : language === 'de' ? q.content.title_de : q.content.title,
        } : undefined,
        answers: q.answers.map((a) => ({
          id: a.id,
          answer: language === 'en' ? a.answer_en : language === 'de' ? a.answer_de : a.answer,
          created_at: q.created_at,
          expert: a.expert,
        })),
      }));
      setQuestions(demoQuestions);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('community_questions')
        .select('id, question, created_at, user_id, content_id')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        const questionsWithDetails = await Promise.all(
          data.map(async (q) => {
            const [userRes, contentRes, answersRes] = await Promise.all([
              supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url')
                .eq('id', q.user_id)
                .single(),
              q.content_id
                ? supabase
                    .from('expert_contents')
                    .select('id, title')
                    .eq('id', q.content_id)
                    .single()
                : Promise.resolve({ data: null }),
              supabase
                .from('community_answers')
                .select('id, answer, created_at, expert_id')
                .eq('question_id', q.id),
            ]);

            // Fetch expert info for answers
            const answersWithExperts = await Promise.all(
              (answersRes.data || []).map(async (a: any) => {
                const { data: expert } = await supabase
                  .from('profiles')
                  .select('first_name, last_name, avatar_url')
                  .eq('id', a.expert_id)
                  .single();
                return { ...a, expert };
              })
            );

            return {
              ...q,
              user: userRes.data,
              content: contentRes.data,
              answers: answersWithExperts,
            };
          })
        );
        setQuestions(questionsWithDetails);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [isDemoMode, language]);

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-purple-500" />
            </div>
            {t('community.qa_title')}
          </h2>
          <p className="text-muted-foreground mt-2">
            {t('community.qa_subtitle')}
          </p>
        </div>

        {user && (
          <Button
            onClick={() => setIsAskModalOpen(true)}
            variant="outline"
            className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
            size="lg"
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            {t('community.ask_question')}
          </Button>
        )}
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : questions.length > 0 ? (
          questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))
        ) : (
          <Card className="bg-card border-border p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">{t('community.qa_empty_title')}</h3>
            <p className="text-muted-foreground">{t('community.qa_empty_hint')}</p>
          </Card>
        )}
      </div>

      {/* Ask question modal */}
      <AskQuestionModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        onSuccess={() => {
          setIsAskModalOpen(false);
          loadQuestions();
        }}
      />
    </section>
  );
};

const QuestionCard = ({ question }: { question: Question }) => {
  const { t, language } = useLanguage();

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-5">
        {/* Questioner */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={question.user?.avatar_url || undefined} />
            <AvatarFallback className="bg-purple-500/20 text-purple-500">
              {question.user?.first_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-foreground">
              {question.user?.first_name} {question.user?.last_name}
            </p>
            {question.content && (
              <p className="text-xs text-muted-foreground">
                {t('community.about')} {question.content.title}
              </p>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(question.created_at).toLocaleDateString(language === 'hu' ? 'hu-HU' : 'en-US')}
          </span>
        </div>

        {/* Question */}
        <p className="text-foreground mb-4">{question.question}</p>

        {/* Answers */}
        {question.answers && question.answers.length > 0 && (
          <div className="border-t border-border pt-4 mt-4 space-y-4">
            {question.answers.map((answer) => (
              <div key={answer.id} className="flex items-start gap-3 pl-4 border-l-2 border-primary">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={answer.expert?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {answer.expert?.first_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-primary">
                    {answer.expert?.first_name} {answer.expert?.last_name}
                    <Badge className="ml-2 bg-primary/20 text-primary text-xs">
                      {t('community.expert')}
                    </Badge>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {answer.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Waiting for answer */}
        {(!question.answers || question.answers.length === 0) && (
          <div className="text-center pt-4 border-t border-border mt-4">
            <p className="text-sm text-muted-foreground">
              {t('community.waiting_for_answer')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AskQuestionModal = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    content_id: '',
  });
  const [myContents, setMyContents] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    const loadMyContents = async () => {
      if (!user || !isOpen) return;

      const { data } = await supabase
        .from('content_access')
        .select('content_id')
        .eq('user_id', user.id);

      if (data && data.length > 0) {
        const contentIds = data.map((d) => d.content_id);
        const { data: contents } = await supabase
          .from('expert_contents')
          .select('id, title')
          .in('id', contentIds);

        setMyContents(contents || []);
      }
    };

    loadMyContents();
  }, [user, isOpen]);

  const handleSubmit = async () => {
    if (!formData.question.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('community_questions').insert({
        user_id: user.id,
        question: formData.question,
        content_id: formData.content_id || null,
      });

      if (error) throw error;

      toast.success(t('community.question_submitted'));
      setFormData({ question: '', content_id: '' });
      onSuccess();
    } catch (error) {
      console.error('Error submitting question:', error);
      toast.error(t('community.question_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-purple-500" />
            {t('community.ask_question')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('community.your_question')}</Label>
            <Textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder={t('community.question_placeholder')}
              className="bg-background border-border min-h-[100px]"
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('community.related_to')}</Label>
            <Select
              value={formData.content_id}
              onValueChange={(value) => setFormData({ ...formData, content_id: value })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder={t('community.select_workshop_secret')} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {myContents.map((content) => (
                  <SelectItem key={content.id} value={content.id}>
                    {content.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.question.trim() || isSubmitting}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {t('community.submit_question')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// LOCAL PARTNERS SECTION
// ============================================

const LocalPartnersSection = () => {
  const { t } = useLanguage();
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Demo mode mock partners
  const DEMO_PARTNERS: Partner[] = [
    {
      id: 'demo-partner-1',
      name: 'Káli Panzió',
      logo_url: null,
      website_url: 'https://kalipanzio.hu',
      description: 'Családias vendéglátás a Káli-medence szívében. Helyi termékek és programok.',
      category: 'accommodation'
    },
    {
      id: 'demo-partner-2',
      name: 'Bio Kert Kft.',
      logo_url: null,
      website_url: 'https://biokert.hu',
      description: 'Ökológiai gazdálkodás és fenntartható mezőgazdaság.',
      category: 'agriculture'
    },
    {
      id: 'demo-partner-3',
      name: 'Helyi Termék Bolt',
      logo_url: null,
      website_url: null,
      description: 'Közvetlenül a termelőktől: méz, lekvár, házi tészta és más finomságok.',
      category: 'retail'
    }
  ];

  useEffect(() => {
    const loadPartners = async () => {
      setIsLoading(true);
      
      // Use mock data in demo mode
      if (isDemoMode) {
        setPartners(DEMO_PARTNERS);
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('local_partners')
          .select('*')
          .eq('is_active', true)
          .order('name');

        setPartners(data || []);
      } catch (error) {
        console.error('Error loading partners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPartners();
  }, [isDemoMode]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (partners.length === 0) return null;

  const handlePartnerClick = (partner: Partner) => {
    if (partner.website_url) {
      window.open(partner.website_url, '_blank', 'noopener,noreferrer');
    } else {
      // Navigate to marketplace filtered by this sponsor
      navigate(`/piacer?sponsor=${encodeURIComponent(partner.name)}`);
    }
  };

  return (
    <section className="relative z-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-accent" />
          </div>
          {t('community.partners_title')}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t('community.partners_subtitle')}
        </p>
      </div>

      {/* Partner cards - Now clickable */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map((partner) => (
          <Card
            key={partner.id}
            onClick={() => handlePartnerClick(partner)}
            className="bg-card border-border p-5 hover:border-accent/50 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              {partner.logo_url ? (
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="w-16 h-16 rounded-lg object-contain bg-background p-2 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <Building2 className="h-8 w-8 text-accent" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{partner.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {partner.description}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-primary">
              <ExternalLink className="h-4 w-4" />
              {partner.website_url ? t('community.visit_website') : t('community.view_programs')}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default CommunityHubNew;
