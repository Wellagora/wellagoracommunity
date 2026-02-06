import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MessageCircle, Camera, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ImagePost {
  id: string;
  content: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

const CommunityGallery = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<ImagePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<ImagePost | null>(null);

  useEffect(() => {
    fetchImagePosts();
  }, []);

  const fetchImagePosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          id, content, image_url, likes_count, comments_count, created_at,
          author:profiles!author_id(id, first_name, last_name, avatar_url)
        `)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const getFullName = (firstName: string | null, lastName: string | null) => {
    return `${firstName || ''} ${lastName || ''}`.trim() || 'User';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">{t('community.share_first_photo')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('community.which_program_inspired')}
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <Card className="overflow-hidden aspect-square relative group">
                <img
                  src={post.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={post.author.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {post.author.first_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {getFullName(post.author.first_name, post.author.last_name)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments_count}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal for full post view */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedPost.author.avatar_url || undefined} />
                    <AvatarFallback>
                      {selectedPost.author.first_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {getFullName(selectedPost.author.first_name, selectedPost.author.last_name)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(selectedPost.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPost(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <img
                src={selectedPost.image_url}
                alt="Post"
                className="w-full max-h-96 object-contain bg-gray-50 rounded-lg"
              />

              {selectedPost.content && (
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedPost.content}
                </p>
              )}

              <div className="flex items-center gap-4 pt-4 border-t">
                <Badge variant="secondary" className="gap-1">
                  <Heart className="w-4 h-4" />
                  {selectedPost.likes_count}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {selectedPost.comments_count}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommunityGallery;
