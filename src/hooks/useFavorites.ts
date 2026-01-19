import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseFavoritesReturn {
  favorites: string[];
  isLoading: boolean;
  isFavorite: (contentId: string) => boolean;
  toggleFavorite: (contentId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useFavorites = (): UseFavoritesReturn => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('[useFavorites] Fetching favorites for user:', user.id);
      
      const { data, error } = await supabase
        .from('favorites')
        .select('content_id')
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('[useFavorites] Fetched favorites:', data?.length || 0, 'items');
      setFavorites(data?.map(f => f.content_id) || []);
    } catch (err) {
      console.error('[useFavorites] Error fetching favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((contentId: string): boolean => {
    return favorites.includes(contentId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (contentId: string) => {
    if (!user) {
      toast.error(t('auth.login_required') || 'Jelentkezz be a kedvencek mentéséhez');
      return;
    }

    const isCurrentlyFavorite = favorites.includes(contentId);

    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        console.log('[useFavorites] Removing favorite:', { userId: user.id, contentId });
        
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', contentId);

        if (error) {
          console.error('[useFavorites] DELETE error:', error);
          throw error;
        }

        console.log('[useFavorites] DELETE successful');
        setFavorites(prev => prev.filter(id => id !== contentId));
        toast.success(t('favorites.removed') || 'Eltávolítva a kedvencekből');
      } else {
        // Add to favorites
        console.log('[useFavorites] Adding favorite:', { userId: user.id, contentId });
        
        const { data, error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            content_id: contentId
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            console.log('[useFavorites] Already favorited (duplicate key)');
            return;
          }
          console.error('[useFavorites] INSERT error:', error);
          throw error;
        }

        console.log('[useFavorites] INSERT successful:', data);
        setFavorites(prev => [...prev, contentId]);
        toast.success(t('favorites.added') || 'Hozzáadva a kedvencekhez ❤️');
      }
    } catch (err) {
      console.error('[useFavorites] Error toggling favorite:', err);
      toast.error(t('common.error') || 'Hiba történt');
    }
  }, [user, favorites, t]);

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites
  };
};

export default useFavorites;
