import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, MapPin, Calendar, Users, Loader2 } from 'lucide-react';
import ChallengeSponsorshipModal from '@/components/challenges/ChallengeSponsorshipModal';

interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points_base: number;
  image_url: string | null;
  is_continuous: boolean;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  translations: any;
  existing_sponsorship: boolean;
}

const BrowseProgramsPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { currentProject } = useProject();
  const { t, language } = useLanguage();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<{ id: string; title: string } | null>(null);

  const isSponsor = profile?.user_role && ['business', 'government', 'ngo'].includes(profile.user_role);

  useEffect(() => {
    if (currentProject && user) {
      loadPrograms();
    }
  }, [currentProject, user]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      
      // Get all active programs for this project
      const { data: programsData, error: programsError } = await supabase
        .from('challenge_definitions')
        .select('*')
        .eq('project_id', currentProject?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (programsError) throw programsError;

      // Get existing sponsorships to mark which programs are already sponsored
      const { data: sponsorships } = await supabase
        .from('challenge_sponsorships')
        .select('challenge_id')
        .eq('project_id', currentProject?.id)
        .eq('status', 'active');

      const sponsoredIds = new Set(sponsorships?.map(s => s.challenge_id) || []);

      const enrichedPrograms = (programsData || []).map(program => ({
        ...program,
        existing_sponsorship: sponsoredIds.has(program.id)
      }));

      setPrograms(enrichedPrograms);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedTitle = (program: Program): string => {
    const translations = program.translations || {};
    return translations[language]?.title || program.title || program.id;
  };

  const getLocalizedDescription = (program: Program): string => {
    const translations = program.translations || {};
    return translations[language]?.description || program.description || '';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      energy: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
      transport: 'bg-blue-500/10 text-blue-600 border-blue-200',
      waste: 'bg-green-500/10 text-green-600 border-green-200',
      water: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
      food: 'bg-orange-500/10 text-orange-600 border-orange-200',
      community: 'bg-purple-500/10 text-purple-600 border-purple-200'
    };
    return colors[category] || 'bg-gray-500/10 text-gray-600 border-gray-200';
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      beginner: t('challenges.difficulty.beginner'),
      intermediate: t('challenges.difficulty.intermediate'),
      advanced: t('challenges.difficulty.advanced')
    };
    return labels[difficulty] || difficulty;
  };

  if (!user || !isSponsor) {
    return (
      <div className="min-h-screen bg-gradient-light-transition flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('sponsor.access_denied')}</h2>
          <Button onClick={() => navigate('/dashboard')}>
            {t('common.back_to_dashboard')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light-transition">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/sponsor-dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('sponsor.back_to_dashboard')}
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t('sponsor.browse_programs')}
          </h1>
          <p className="text-muted-foreground">
            {t('sponsor.browse_programs_desc')}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : programs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">{t('sponsor.no_programs')}</p>
              <Button onClick={() => navigate('/dashboard')}>
                {t('common.back_to_dashboard')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Card key={program.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {program.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={program.image_url}
                      alt={getLocalizedTitle(program)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={getCategoryColor(program.category)}>
                      {program.category}
                    </Badge>
                    <Badge variant="outline">{getDifficultyLabel(program.difficulty)}</Badge>
                  </div>
                  <CardTitle className="text-lg">{getLocalizedTitle(program)}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {getLocalizedDescription(program)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Trophy className="w-4 h-4" />
                      <span>{program.points_base} {t('challenges.points')}</span>
                    </div>
                    
                    {program.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{program.location}</span>
                      </div>
                    )}

                    {!program.is_continuous && program.start_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(program.start_date).toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="pt-3">
                      {program.existing_sponsorship ? (
                        <Button variant="outline" disabled className="w-full">
                          {t('sponsor.already_sponsored')}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setSelectedProgram({ 
                            id: program.id, 
                            title: getLocalizedTitle(program) 
                          })}
                          className="w-full bg-gradient-primary"
                        >
                          {t('sponsor.sponsor_program')}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedProgram && (
        <ChallengeSponsorshipModal
          open={!!selectedProgram}
          onOpenChange={(open) => !open && setSelectedProgram(null)}
          challengeId={selectedProgram.id}
          challengeTitle={selectedProgram.title}
          region={currentProject?.region_name || ''}
        />
      )}
    </div>
  );
};

export default BrowseProgramsPage;
