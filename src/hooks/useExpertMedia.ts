import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AISuggestion {
  category: string;
  suggestion_text: string;
  matched_program_id: string | null;
  matched_program_title: string | null;
  confidence: number;
  keywords: string[];
}

export interface ExpertMedia {
  id: string;
  expert_id: string;
  file_url: string;
  file_type: 'video' | 'image';
  thumbnail_url: string | null;
  title: string | null;
  status: 'raw' | 'in_draft' | 'published';
  program_id: string | null;
  ai_suggestion: AISuggestion | null;
  analyzed_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  usage_count?: number;
}

export const useExpertMedia = () => {
  const { user } = useAuth();
  const [media, setMedia] = useState<ExpertMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const fetchMedia = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('expert_media')
        .select('*')
        .eq('expert_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch usage counts from junction table
      const mediaIds = data?.map(m => m.id) || [];
      if (mediaIds.length > 0) {
        const { data: usageData } = await supabase
          .from('program_media_links')
          .select('media_id')
          .in('media_id', mediaIds);
        
        const usageCounts: Record<string, number> = {};
        usageData?.forEach(link => {
          usageCounts[link.media_id] = (usageCounts[link.media_id] || 0) + 1;
        });
        
        const enrichedData = data?.map(m => ({
          ...m,
          ai_suggestion: m.ai_suggestion as unknown as AISuggestion | null,
          file_type: m.file_type as 'video' | 'image',
          status: m.status as 'raw' | 'in_draft' | 'published',
          usage_count: usageCounts[m.id] || 0
        })) as ExpertMedia[];
        
        setMedia(enrichedData || []);
      } else {
        const typedData = data?.map(m => ({
          ...m,
          ai_suggestion: m.ai_suggestion as unknown as AISuggestion | null,
          file_type: m.file_type as 'video' | 'image',
          status: m.status as 'raw' | 'in_draft' | 'published',
          usage_count: 0
        })) as ExpertMedia[];
        setMedia(typedData || []);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [user?.id]);

  const analyzeMedia = async (mediaItem: ExpertMedia) => {
    if (!user?.id) return null;
    
    setAnalyzing(mediaItem.id);
    
    try {
      console.log('[useExpertMedia] Starting AI analysis for:', mediaItem.id);
      
      const { data, error } = await supabase.functions.invoke('analyze-media', {
        body: {
          media_id: mediaItem.id,
          file_url: mediaItem.file_url,
          file_type: mediaItem.file_type,
          expert_id: user.id
        }
      });
      
      if (error) throw error;
      
      console.log('[useExpertMedia] Analysis result:', data);
      
      if (data?.analysis) {
        // Update local state with analysis result
        setMedia(prev => prev.map(m => 
          m.id === mediaItem.id 
            ? { ...m, ai_suggestion: data.analysis, analyzed_at: new Date().toISOString() } 
            : m
        ));
        
        toast.success('🤖 WellBot elemezte a tartalmat!');
        return data.analysis as AISuggestion;
      }
      
      return null;
    } catch (error) {
      console.error('Error analyzing media:', error);
      toast.error('Hiba az AI elemzés során');
      return null;
    } finally {
      setAnalyzing(null);
    }
  };

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

      const newMedia = { 
        ...data, 
        ai_suggestion: null,
        file_type: data.file_type as 'video' | 'image',
        status: data.status as 'raw' | 'in_draft' | 'published',
        usage_count: 0 
      } as ExpertMedia;
      
      // Optimistic update
      setMedia(prev => [newMedia, ...prev]);
      
      toast.success('Mentve a Médiatáradba! 📁');
      
      // Auto-trigger AI analysis for new uploads
      setTimeout(() => {
        analyzeMedia(newMedia);
      }, 1000);
      
      return newMedia;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Hiba a feltöltés során');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const linkMediaToProgram = async (mediaId: string, programId: string, position: number = 0) => {
    try {
      const { error } = await supabase
        .from('program_media_links')
        .insert({
          media_id: mediaId,
          program_id: programId,
          position
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('Ez a média már hozzá van adva ehhez a programhoz');
          return true;
        }
        throw error;
      }

      // Update local state
      setMedia(prev => prev.map(m => 
        m.id === mediaId 
          ? { ...m, usage_count: (m.usage_count || 0) + 1, status: 'in_draft' as const } 
          : m
      ));
      
      toast.success('Média hozzáadva a programhoz!');
      return true;
    } catch (error) {
      console.error('Error linking media to program:', error);
      toast.error('Hiba a média hozzáadása során');
      return false;
    }
  };

  const updateMediaStatus = async (mediaId: string, status: 'raw' | 'in_draft' | 'published', programId?: string) => {
    try {
      const updateData: Record<string, unknown> = { status };
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
        m.id === mediaId ? { ...m, status, program_id: programId || m.program_id } : m
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

      // Delete from database (cascade will remove program links)
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

  const dismissSuggestion = async (mediaId: string) => {
    try {
      const { error } = await supabase
        .from('expert_media')
        .update({ ai_suggestion: null })
        .eq('id', mediaId);

      if (error) throw error;

      setMedia(prev => prev.map(m => 
        m.id === mediaId ? { ...m, ai_suggestion: null } : m
      ));
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    }
  };

  const stats = {
    total: media.length,
    raw: media.filter(m => m.status === 'raw').length,
    inDraft: media.filter(m => m.status === 'in_draft').length,
    published: media.filter(m => m.status === 'published').length,
    withSuggestions: media.filter(m => m.ai_suggestion && m.status === 'raw').length
  };

  return {
    media,
    loading,
    uploading,
    analyzing,
    stats,
    uploadMedia,
    analyzeMedia,
    linkMediaToProgram,
    updateMediaStatus,
    deleteMedia,
    dismissSuggestion,
    refetch: fetchMedia
  };
};
