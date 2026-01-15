import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ExpertMedia {
  id: string;
  expert_id: string;
  file_url: string;
  file_type: 'video' | 'image';
  thumbnail_url: string | null;
  title: string | null;
  status: 'raw' | 'in_draft' | 'published';
  program_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useExpertMedia = () => {
  const { user } = useAuth();
  const [media, setMedia] = useState<ExpertMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('expert_media')
        .select('*')
        .eq('expert_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia((data as ExpertMedia[]) || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [user?.id]);

  const uploadMedia = async (file: File, type: 'video' | 'image'): Promise<ExpertMedia | null> => {
    if (!user?.id) {
      toast.error('Bejelentkezés szükséges');
      return null;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('expert-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('expert-media')
        .getPublicUrl(filePath);

      // Generate thumbnail URL for videos (placeholder for now)
      let thumbnailUrl = null;
      if (type === 'image') {
        thumbnailUrl = publicUrl;
      }

      // Create database record
      const { data, error: dbError } = await supabase
        .from('expert_media')
        .insert({
          expert_id: user.id,
          file_url: publicUrl,
          file_type: type,
          thumbnail_url: thumbnailUrl,
          status: 'raw'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Optimistic update
      setMedia(prev => [data as ExpertMedia, ...prev]);
      
      toast.success('Mentve a Médiatáradba! 📁');
      return data as ExpertMedia;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Hiba a feltöltés során');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const updateMediaStatus = async (mediaId: string, status: 'raw' | 'in_draft' | 'published', programId?: string) => {
    try {
      const updateData: Partial<ExpertMedia> = { status };
      if (programId) {
        updateData.program_id = programId;
      }

      const { error } = await supabase
        .from('expert_media')
        .update(updateData)
        .eq('id', mediaId);

      if (error) throw error;

      // Optimistic update
      setMedia(prev => prev.map(m => 
        m.id === mediaId ? { ...m, ...updateData } : m
      ));
    } catch (error) {
      console.error('Error updating media status:', error);
      toast.error('Hiba a státusz frissítése során');
    }
  };

  const deleteMedia = async (mediaId: string) => {
    try {
      const mediaItem = media.find(m => m.id === mediaId);
      if (!mediaItem) return;

      // Delete from storage
      const filePath = mediaItem.file_url.split('/expert-media/')[1];
      if (filePath) {
        await supabase.storage
          .from('expert-media')
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('expert_media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;

      // Optimistic update
      setMedia(prev => prev.filter(m => m.id !== mediaId));
      toast.success('Média törölve');
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Hiba a törlés során');
    }
  };

  const stats = {
    total: media.length,
    raw: media.filter(m => m.status === 'raw').length,
    inDraft: media.filter(m => m.status === 'in_draft').length,
    published: media.filter(m => m.status === 'published').length
  };

  return {
    media,
    loading,
    uploading,
    stats,
    uploadMedia,
    updateMediaStatus,
    deleteMedia,
    refetch: fetchMedia
  };
};
