import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Calendar, Clock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { hu, de, enUS } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface RegionalProgram {
  id: string;
  title: string;
  image_url: string | null;
  category: string | null;
  start_date?: string;
  location?: string;
  is_sponsored: boolean;
  sponsor_name: string | null;
}

const RegionalProgramsHighlight = () => {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<RegionalProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRegion, setUserRegion] = useState<string>('');

  const getDateLocale = () => {
    switch (language) {
      case 'hu': return hu;
      case 'de': return de;
      default: return enUS;
    }
  };

  useEffect(() => {
    const fetchRegionalPrograms = async () => {
      try {
        // Determine user's region from profile
        const profileData = profile as any;
        const region = profileData?.location_city || profileData?.city || profileData?.location || 
          (language === 'hu' ? 'Budapest' : language === 'de' ? 'Wien' : 'Budapest');
        setUserRegion(region);

        // Fetch upcoming events in user's region
        const { data: events } = await supabase
          .from('events')
          .select(`
            id,
            title,
            image_url,
            start_date,
            location_name,
            village,
            expert_contents:program_id(
              id,
              title,
              category,
              is_sponsored,
              sponsor_name,
              image_url
            )
          `)
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })
          .limit(6);

        // Fetch sponsored content in region
        const { data: content } = await supabase
          .from('expert_contents')
          .select('id, title, image_url, category, is_sponsored, sponsor_name')
          .eq('is_published', true)
          .eq('is_sponsored', true)
          .limit(3);

        const programList: RegionalProgram[] = [];

        // Process events
        events?.forEach((e: any) => {
          programList.push({
            id: e.id,
            title: e.expert_contents?.title || e.title,
            image_url: e.expert_contents?.image_url || e.image_url,
            category: e.expert_contents?.category,
            start_date: e.start_date,
            location: e.location_name || e.village,
            is_sponsored: e.expert_contents?.is_sponsored || false,
            sponsor_name: e.expert_contents?.sponsor_name
          });
        });

        // Add sponsored content if we don't have enough
        if (programList.length < 3 && content) {
          content.forEach((c: any) => {
            if (!programList.find(p => p.id === c.id) && programList.length < 3) {
              programList.push({
                id: c.id,
                title: c.title,
                image_url: c.image_url,
                category: c.category,
                is_sponsored: c.is_sponsored,
                sponsor_name: c.sponsor_name
              });
            }
          });
        }

        setPrograms(programList.slice(0, 3));
      } catch (error) {
        console.error('Error fetching regional programs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegionalPrograms();
  }, [profile, language]);

  const getCategoryLabel = (category: string | null) => {
    if (!category) return null;
    const labels: Record<string, Record<string, string>> = {
      sustainability: { hu: 'Fenntarthatóság', en: 'Sustainability', de: 'Nachhaltigkeit' },
      food: { hu: 'Élelmiszer', en: 'Food', de: 'Essen' },
      wellness: { hu: 'Wellness', en: 'Wellness', de: 'Wellness' },
      creative: { hu: 'Kreatív', en: 'Creative', de: 'Kreativ' },
    };
    return labels[category]?.[language] || category;
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-violet-50/50 to-fuchsia-50/50">
        <CardTitle className="flex items-center justify-between text-base text-black">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-violet-600" />
            <span>
              {language === 'hu' ? 'Közelgő programok' : 'Upcoming in'}{' '}
              <span className="text-violet-600">{userRegion}</span>
            </span>
          </div>
          <Badge variant="outline" className="text-xs border-violet-200 text-violet-700 bg-violet-50">
            <Sparkles className="w-3 h-3 mr-1" />
            {language === 'hu' ? 'Regionális' : 'Regional'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        {programs.length === 0 ? (
          <div className="text-center py-6">
            <MapPin className="w-10 h-10 mx-auto text-black/20 mb-2" />
            <p className="text-sm text-black/50">
              {language === 'hu' 
                ? 'Még nincsenek programok a közeledben'
                : 'No programs nearby yet'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => navigate('/piacer')}
            >
              {language === 'hu' ? 'Összes program' : 'Browse all'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map((program, idx) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/[0.02] transition-colors cursor-pointer group"
                onClick={() => navigate(`/program/${program.id}`)}
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-black/5">
                  {program.image_url ? (
                    <img 
                      src={program.image_url} 
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-black/30" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-black truncate group-hover:text-violet-700 transition-colors">
                    {program.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {program.start_date && (
                      <span className="text-xs text-black/50 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(program.start_date), 'MMM d', { locale: getDateLocale() })}
                      </span>
                    )}
                    {program.location && (
                      <span className="text-xs text-black/50 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {program.location}
                      </span>
                    )}
                  </div>
                  {program.is_sponsored && (
                    <Badge 
                      variant="outline" 
                      className="mt-1 text-xs border-emerald-200 bg-emerald-50 text-emerald-700"
                    >
                      {language === 'hu' ? 'Támogatott' : 'Sponsored'}
                    </Badge>
                  )}
                </div>

                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-black/30 group-hover:text-violet-600 transition-colors flex-shrink-0" />
              </motion.div>
            ))}

            {/* View All Button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
              onClick={() => navigate('/piacer')}
            >
              {language === 'hu' ? 'Összes program megtekintése' : 'View all programs'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegionalProgramsHighlight;
