import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Image, 
  ChevronDown, 
  ChevronUp,
  Wand2,
  Trash2,
  Calendar,
  FolderOpen,
  Bot,
  Sparkles,
  Eye,
  Layers,
  X,
  Plus,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExpertMedia, AISuggestion } from '@/hooks/useExpertMedia';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

interface MediaLibraryProps {
  media: ExpertMedia[];
  loading: boolean;
  analyzing: string | null;
  onDelete: (mediaId: string) => void;
  onConvertToProgram: (media: ExpertMedia) => void;
  onAddToProgram: (media: ExpertMedia, programId: string) => void;
  onDismissSuggestion: (mediaId: string) => void;
  onAnalyze: (media: ExpertMedia) => void;
}

const MediaLibrary = ({ 
  media, 
  loading, 
  analyzing,
  onDelete, 
  onConvertToProgram,
  onAddToProgram,
  onDismissSuggestion,
  onAnalyze
}: MediaLibraryProps) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(media.length > 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'raw':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
            {t('expert_studio.status_raw') || 'Raw Material'}
          </Badge>
        );
      case 'in_draft':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
            Vázlatban
          </Badge>
        );
      case 'published':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
            Publikálva
          </Badge>
        );
      default:
        return null;
    }
  };

  const getFileTypeIcon = (type: string) => {
    return type === 'video' ? (
      <div className="absolute top-2 left-2 bg-black/60 rounded-full p-1.5">
        <Video className="w-3.5 h-3.5 text-white" />
      </div>
    ) : (
      <div className="absolute top-2 left-2 bg-black/60 rounded-full p-1.5">
        <Image className="w-3.5 h-3.5 text-white" />
      </div>
    );
  };

  const rawMediaWithSuggestions = media.filter(m => m.status === 'raw' && m.ai_suggestion);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-5 w-8 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-video bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl p-6 mb-6 shadow-sm"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <div className="flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">{t('expert_studio.media_library') || 'Media Gallery'}</h3>
          <Badge variant="secondary" className="text-xs">
            {media.length}
          </Badge>
          {rawMediaWithSuggestions.length > 0 && (
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs flex items-center gap-1">
              <Bot className="w-3 h-3" />
              {rawMediaWithSuggestions.length} {t('expert_studio.suggestions') || 'suggestions'}
            </Badge>
          )}
        </div>
        <div className="p-1 rounded-lg group-hover:bg-muted/50 transition-colors">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {media.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Még nincs nyersanyagod. Használd a Videó vagy Fotó gombot az első felvételhez!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* AI Suggestions Section */}
                {rawMediaWithSuggestions.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">WellBot javaslatok</span>
                    </div>
                    <div className="space-y-3">
                      {rawMediaWithSuggestions.map((item) => (
                        <AISuggestionCard
                          key={item.id}
                          media={item}
                          suggestion={item.ai_suggestion!}
                          onAddToProgram={onAddToProgram}
                          onConvertToProgram={onConvertToProgram}
                          onDismiss={onDismissSuggestion}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Media Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {media.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="group relative bg-white/80 backdrop-blur-sm border-[0.5px] border-black/5 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {item.thumbnail_url || item.file_type === 'image' ? (
                          <img 
                            src={item.thumbnail_url || item.file_url} 
                            alt={item.title || 'Media'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <Video className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* File type indicator */}
                        {getFileTypeIcon(item.file_type)}
                        
                        {/* Status badge */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                          {getStatusBadge(item.status)}
                          {item.view_count > 100 && (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                              🔥 Népszerű
                            </Badge>
                          )}
                        </div>

                        {/* Usage count badge */}
                        {(item.usage_count || 0) > 0 && (
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-black/60 text-white border-0">
                              <Layers className="w-3 h-3" />
                              {item.usage_count} programban
                            </Badge>
                          </div>
                        )}

                        {/* Analyzing overlay */}
                        {analyzing === item.id && (
                          <div className="absolute inset-0 bg-purple-500/80 flex items-center justify-center">
                            <div className="text-white text-center">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                              <span className="text-xs">WellBot elemez...</span>
                            </div>
                          </div>
                        )}

                        {/* Hover overlay with actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                          {item.status === 'raw' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => onConvertToProgram(item)}
                                className="bg-white text-black hover:bg-white/90 text-xs h-8"
                              >
                                <Wand2 className="w-3.5 h-3.5 mr-1" />
                                Programmá
                              </Button>
                              {!item.ai_suggestion && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => onAnalyze(item)}
                                  className="h-8"
                                  disabled={analyzing === item.id}
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(item.created_at), 'MMM d, HH:mm', { locale: hu })}
                          </p>
                          {item.view_count > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {item.view_count}
                            </span>
                          )}
                        </div>
                        {item.title && (
                          <p className="text-sm font-medium text-foreground mt-1 truncate">
                            {item.title}
                          </p>
                        )}
                        {item.ai_suggestion?.category && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {item.ai_suggestion.category}
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// AI Suggestion Card Component
interface AISuggestionCardProps {
  media: ExpertMedia;
  suggestion: AISuggestion;
  onAddToProgram: (media: ExpertMedia, programId: string) => void;
  onConvertToProgram: (media: ExpertMedia) => void;
  onDismiss: (mediaId: string) => void;
}

const AISuggestionCard = ({ 
  media, 
  suggestion, 
  onAddToProgram, 
  onConvertToProgram, 
  onDismiss 
}: AISuggestionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4"
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          {media.thumbnail_url || media.file_type === 'image' ? (
            <img 
              src={media.thumbnail_url || media.file_url} 
              alt="Media" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">WellBot javaslat</span>
              <Badge variant="outline" className="text-xs bg-white">
                {Math.round(suggestion.confidence * 100)}% biztos
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => onDismiss(media.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-foreground mb-3">
            {suggestion.suggestion_text}
          </p>
          
          {suggestion.matched_program_title && suggestion.matched_program_id ? (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="h-8 bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => onAddToProgram(media, suggestion.matched_program_id!)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Hozzáadom: {suggestion.matched_program_title}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => onConvertToProgram(media)}
              >
                Új program
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="h-8 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => onConvertToProgram(media)}
            >
              <Wand2 className="w-3.5 h-3.5 mr-1" />
              Új program készítése
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MediaLibrary;
