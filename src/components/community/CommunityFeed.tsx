import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Heart,
  MessageCircle,
  Share2,
  HelpCircle,
  Lightbulb,
  Trophy,
  Sparkles,
  CheckCircle,
  ImagePlus,
  Send,
  X,
  Loader2,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { awardPoints, WELLPOINTS_QUERY_KEY, updateStreak, STREAK_QUERY_KEY } from '@/lib/wellpoints';
import { useQueryClient } from '@tanstack/react-query';

interface CommunityPost {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  post_type: 'general' | 'question' | 'success_story' | 'tip' | 'announcement';
  related_program_id: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    user_role: string | null;
    expert_title: string | null;
    is_founding_expert: boolean | null;
  };
  likes: { user_id: string }[];
  comments: {
    id: string;
    content: string;
    created_at: string;
    author: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
      user_role: string | null;
      expert_title: string | null;
      is_founding_expert: boolean | null;
    };
  }[];
}

const CommunityFeed = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'general' | 'question' | 'success_story' | 'tip'>('general');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          author:profiles!author_id(id, first_name, last_name, avatar_url, user_role, expert_title, is_founding_expert),
          likes:community_post_likes(user_id),
          comments:community_post_comments(
            id, content, created_at,
            author:profiles!author_id(id, first_name, last_name, avatar_url, user_role, expert_title, is_founding_expert)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setNewPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('community-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload image');
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('community-images')
        .getPublicUrl(uploadData.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim()) return;

    try {
      setSubmitting(true);

      let imageUrl: string | null = null;
      if (newPostImage) {
        imageUrl = await uploadImage(newPostImage);
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          author_id: user.id,
          content: newPostContent.trim(),
          image_url: imageUrl,
          post_type: newPostType,
        })
        .select(`
          *,
          author:profiles!author_id(id, first_name, last_name, avatar_url, user_role, expert_title, is_founding_expert),
          likes:community_post_likes(user_id),
          comments:community_post_comments(
            id, content, created_at,
            author:profiles!author_id(id, first_name, last_name, avatar_url, user_role, expert_title, is_founding_expert)
          )
        `)
        .single();

      if (error) throw error;

      // Award points for creating post
      await awardPoints(user.id, 'post_created', 'Közösségi poszt létrehozva', data.id, 'community_post');
      queryClient.invalidateQueries({ queryKey: WELLPOINTS_QUERY_KEY(user.id) });
      
      // Update streak
      const streakResult = await updateStreak(user.id);
      queryClient.invalidateQueries({ queryKey: STREAK_QUERY_KEY(user.id) });
      if (streakResult.isNewDay && streakResult.streak > 1) {
        toast.success(`🔥 ${streakResult.streak} napos sorozat!`, { 
          description: streakResult.bonusAwarded ? 'Bónusz pontok jóváírva!' : 'Szép munka, folytasd!'
        });
      }

      setPosts([data, ...posts]);
      setNewPostContent('');
      setNewPostType('general');
      setNewPostImage(null);
      setImagePreview(null);
      setShowPostCreator(false);
      toast.success('+5 WellPont! 🪙', { description: 'Köszönjük az aktivitásod!' });
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isLiked = post.likes.some(like => like.user_id === user.id);

    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1,
      likes: isLiked 
        ? p.likes.filter(like => like.user_id !== user.id)
        : [...p.likes, { user_id: user.id }]
    } : p));

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_post_likes')
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;

        // Award points for giving like
        await awardPoints(user.id, 'like_given', 'Kedvelés adva', postId, 'like');
        queryClient.invalidateQueries({ queryKey: WELLPOINTS_QUERY_KEY(user.id) });
        
        // Update streak
        const streakResult = await updateStreak(user.id);
        queryClient.invalidateQueries({ queryKey: STREAK_QUERY_KEY(user.id) });
        if (streakResult.isNewDay && streakResult.streak > 1) {
          toast.success(`🔥 ${streakResult.streak} napos sorozat!`, { 
            description: streakResult.bonusAwarded ? 'Bónusz pontok jóváírva!' : 'Szép munka, folytasd!'
          });
        }
        
        // Award points to post author for receiving like
        if (post.author_id !== user.id) {
          await awardPoints(post.author_id, 'like_received', 'Kedvelést kapott', postId, 'like');
          queryClient.invalidateQueries({ queryKey: WELLPOINTS_QUERY_KEY(post.author_id) });
        }
        
        toast.success('+1 WellPont! 🪙', { description: 'Köszönjük az aktivitásod!' });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setPosts(prev => prev.map(p => p.id === postId ? post : p));
      toast.error('Failed to update like');
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: content.trim(),
        })
        .select(`
          id, content, created_at,
          author:profiles!author_id(id, first_name, last_name, avatar_url, user_role, expert_title)
        `)
        .single();

      if (error) throw error;

      // Award points for adding comment
      await awardPoints(user.id, 'comment_added', 'Hozzászólás írva', data.id, 'comment');
      queryClient.invalidateQueries({ queryKey: WELLPOINTS_QUERY_KEY(user.id) });
      
      // Update streak
      const streakResult = await updateStreak(user.id);
      queryClient.invalidateQueries({ queryKey: STREAK_QUERY_KEY(user.id) });
      if (streakResult.isNewDay && streakResult.streak > 1) {
        toast.success(`🔥 ${streakResult.streak} napos sorozat!`, { 
          description: streakResult.bonusAwarded ? 'Bónusz pontok jóváírva!' : 'Szép munka, folytasd!'
        });
      }

      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        comments_count: p.comments_count + 1,
        comments: [...p.comments, data]
      } : p));

      toast.success('+3 WellPont! 🪙', { description: 'Köszönjük az aktivitásod!' });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const getFullName = (firstName: string | null, lastName: string | null) => {
    return `${firstName || ''} ${lastName || ''}`.trim() || 'User';
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'most';
    if (diffMins < 60) return `${diffMins} perce`;
    if (diffHours < 24) return `${diffHours} órája`;
    return `${diffDays} napja`;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Post Creator */}
      {user && (
        <Card className="mb-6 border border-border/50 hover:border-border transition-colors">
          <CardContent className="p-4">
            {!showPostCreator ? (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {getInitials(profile?.first_name || null, profile?.last_name || null)}
                  </AvatarFallback>
                </Avatar>
                <div
                  onClick={() => setShowPostCreator(true)}
                  className="flex-1 bg-muted/50 hover:bg-muted rounded-full px-4 py-2.5 text-muted-foreground cursor-pointer transition-colors"
                >
                  {t('community.create_post')}
                </div>
                <Button variant="ghost" size="icon" className="text-emerald-600">
                  <ImagePlus className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Select value={newPostType} onValueChange={(value: any) => setNewPostType(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{t('community.post_types.general')}</SelectItem>
                      <SelectItem value="question">{t('community.post_types.question')}</SelectItem>
                      <SelectItem value="success_story">{t('community.post_types.success_story')}</SelectItem>
                      <SelectItem value="tip">{t('community.post_types.tip')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => {
                    setShowPostCreator(false);
                    setNewPostContent('');
                    setNewPostImage(null);
                    setImagePreview(null);
                  }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <Textarea
                  placeholder={t('community.create_post')}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-24"
                />

                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setNewPostImage(null);
                        setImagePreview(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <Button variant="ghost" size="sm" className="gap-2" asChild>
                      <span>
                        <ImagePlus className="w-4 h-4" />
                        Add Image
                      </span>
                    </Button>
                  </label>

                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() || submitting}
                    className="gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {t('community.post_button')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <AnimatePresence>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onAddComment={handleAddComment}
              getInitials={getInitials}
              getFullName={getFullName}
              formatTimeAgo={formatTimeAgo}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {posts.length === 0 && (
        <Card className="p-8 md:p-12 text-center border-dashed">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {t('community.welcome_title') || 'Üdv a közösségben!'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t('community.welcome_subtitle') || 'Ez a te közösséged. Oszd meg gondolataidat, kérdezz, vagy inspirálj másokat egy sikertörténettel!'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => setShowPostCreator(true)}
              className="gap-2 bg-black hover:bg-black/90 text-white"
            >
              <Send className="w-4 h-4" />
              {t('community.write_first_post') || 'Első posztom megírása'}
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg bg-slate-50">
              <Sparkles className="w-5 h-5 mx-auto mb-1 text-slate-500" />
              <p className="text-xs text-muted-foreground">{t('community.post_types.general') || 'Általános'}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <HelpCircle className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-muted-foreground">{t('community.post_types.question') || 'Kérdés'}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <p className="text-xs text-muted-foreground">{t('community.post_types.success_story') || 'Sikertörténet'}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <Lightbulb className="w-5 h-5 mx-auto mb-1 text-purple-500" />
              <p className="text-xs text-muted-foreground">{t('community.post_types.tip') || 'Tipp'}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const PostCard = ({
  post,
  onLike,
  onAddComment,
  getInitials,
  getFullName,
  formatTimeAgo,
}: {
  post: CommunityPost;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, content: string) => Promise<void>;
  getInitials: (firstName: string | null, lastName: string | null) => string;
  getFullName: (firstName: string | null, lastName: string | null) => string;
  formatTimeAgo: (date: string) => string;
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const isLiked = user ? post.likes.some(like => like.user_id === user.id) : false;
  const isExpert = post.author.user_role === 'expert';
  const isFoundingExpert = post.author.is_founding_expert === true;

  const postTypeBadges = {
    general: { icon: Sparkles, label: t('community.post_types.general'), className: 'bg-slate-100 text-slate-700' },
    question: { icon: HelpCircle, label: t('community.post_types.question'), className: 'bg-blue-100 text-blue-700' },
    success_story: { icon: Trophy, label: t('community.post_types.success_story'), className: 'bg-amber-100 text-amber-700' },
    tip: { icon: Lightbulb, label: t('community.post_types.tip'), className: 'bg-purple-100 text-purple-700' },
    announcement: { icon: Sparkles, label: 'Announcement', className: 'bg-green-100 text-green-700' },
  };

  const badge = postTypeBadges[post.post_type];
  const BadgeIcon = badge.icon;

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    await onAddComment(post.id, commentText);
    setCommentText('');
    setSubmittingComment(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={cn(
        'shadow-sm hover:shadow-md transition-shadow',
        isExpert && 'border-l-4 border-l-indigo-500'
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={post.author.avatar_url || undefined} />
              <AvatarFallback className={cn(isExpert && 'bg-indigo-100 text-indigo-700')}>
                {getInitials(post.author.first_name, post.author.last_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{getFullName(post.author.first_name, post.author.last_name)}</span>
                {isFoundingExpert && (
                  <Badge className="bg-amber-100 text-amber-800 text-xs gap-1">
                    <Shield className="w-3 h-3" />
                    {t('community.founding_expert') || 'Alapító Szakértő'}
                  </Badge>
                )}
                {isExpert && !isFoundingExpert && post.author.expert_title && (
                  <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {post.author.expert_title}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</span>
            </div>

            <Badge className={cn('text-xs gap-1', badge.className)}>
              <BadgeIcon className="w-3 h-3" />
              {badge.label}
            </Badge>
          </div>

          {/* Content */}
          <p className="mt-3 text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>

          {/* Image */}
          {post.image_url && (
            <div className="mt-3 rounded-lg overflow-hidden bg-gray-50">
              <img
                src={post.image_url}
                alt="Post image"
                className="w-full max-h-96 object-contain bg-gray-50 rounded-lg"
                onError={(e) => {
                  console.error('Image load error:', post.image_url);
                  e.currentTarget.style.display = 'none';
                }}
                loading="lazy"
              />
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center gap-1 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className={cn('gap-1.5', isLiked && 'text-red-500')}
            >
              <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
              <span>{post.likes_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments_count}</span>
            </Button>

            <Button variant="ghost" size="sm" className="gap-1.5 ml-auto">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className={cn(
                  'p-3 rounded-lg',
                  comment.author.user_role === 'expert'
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200'
                    : 'bg-muted/50'
                )}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={comment.author.avatar_url || undefined} />
                      <AvatarFallback className={cn(
                        'text-xs',
                        comment.author.user_role === 'expert' && 'bg-emerald-200 text-emerald-700'
                      )}>
                        {getInitials(comment.author.first_name, comment.author.last_name)}
                      </AvatarFallback>
                    </Avatar>

                    <span className="font-medium text-sm">
                      {getFullName(comment.author.first_name, comment.author.last_name)}
                    </span>

                    {comment.author.user_role === 'expert' && (
                      <Badge className="bg-emerald-600 text-white text-xs gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {t('community.expert_answer')}
                      </Badge>
                    )}

                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.content}</p>
                </div>
              ))}

              {/* Add Comment */}
              {user && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t('community.write_comment')}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || submittingComment}
                  >
                    {submittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CommunityFeed;
