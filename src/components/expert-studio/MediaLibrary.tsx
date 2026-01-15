import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Image, 
  ChevronDown, 
  ChevronUp,
  Wand2,
  Trash2,
  Calendar,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExpertMedia } from '@/hooks/useExpertMedia';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

interface MediaLibraryProps {
  media: ExpertMedia[];
  loading: boolean;
  onDelete: (mediaId: string) => void;
  onConvertToProgram: (media: ExpertMedia) => void;
}

const MediaLibrary = ({ media, loading, onDelete, onConvertToProgram }: MediaLibraryProps) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(media.length > 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'raw':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
            Nyersanyag
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
          <h3 className="text-lg font-semibold text-foreground">Médiatár</h3>
          <Badge variant="secondary" className="text-xs">
            {media.length}
          </Badge>
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
              /* Media Grid */
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
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(item.status)}
                      </div>

                      {/* Hover overlay with actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                        {item.status === 'raw' && (
                          <Button
                            size="sm"
                            onClick={() => onConvertToProgram(item)}
                            className="bg-white text-black hover:bg-white/90 text-xs h-8"
                          >
                            <Wand2 className="w-3.5 h-3.5 mr-1" />
                            Programmá
                          </Button>
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
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(item.created_at), 'MMM d, HH:mm', { locale: hu })}
                      </p>
                      {item.title && (
                        <p className="text-sm font-medium text-foreground mt-1 truncate">
                          {item.title}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MediaLibrary;
