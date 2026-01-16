import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  Target,
  ChevronRight,
  Loader2,
  Gift,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SponsorshipImpact {
  id: string;
  contentTitle: string;
  expertName: string;
  sponsorContribution: number;
  maxSeats: number;
  usedSeats: number;
  totalSpent: number;
  status: 'active' | 'completed';
}

interface ImpactSummary {
  totalSeatsSupported: number;
  totalCreditsSpent: number;
  remainingCredits: number;
  activeSponsorships: number;
  averageConversion: number;
}

const ActiveImpactDashboard = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [sponsorships, setSponsorships] = useState<SponsorshipImpact[]>([]);
  const [summary, setSummary] = useState<ImpactSummary>({
    totalSeatsSupported: 0,
    totalCreditsSpent: 0,
    remainingCredits: 0,
    activeSponsorships: 0,
    averageConversion: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadImpactData();
    }
  }, [user]);

  const loadImpactData = async () => {
    try {
      // Load sponsorships with quota data
      const { data: sponsorshipData } = await supabase
        .from('content_sponsorships')
        .select(`
          id,
          sponsor_contribution_huf,
          max_sponsored_seats,
          sponsored_seats_used,
          is_active,
          expert_contents (
            id,
            title,
            creator_id,
            profiles:creator_id (first_name, last_name)
          )
        `)
        .eq('sponsor_id', user?.id);

      // Load credit balance
      const { data: creditData } = await supabase
        .from('sponsor_credits')
        .select('total_credits, used_credits, available_credits')
        .eq('sponsor_user_id', user?.id)
        .maybeSingle();

      if (sponsorshipData) {
        const mappedSponsorships: SponsorshipImpact[] = sponsorshipData.map(s => {
          const content = s.expert_contents as any;
          const profile = content?.profiles as any;
          const usedSeats = s.sponsored_seats_used || 0;
          const maxSeats = s.max_sponsored_seats || 10;
          
          return {
            id: s.id,
            contentTitle: content?.title || 'Program',
            expertName: profile 
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
              : 'Szakértő',
            sponsorContribution: s.sponsor_contribution_huf || 0,
            maxSeats,
            usedSeats,
            totalSpent: usedSeats * (s.sponsor_contribution_huf || 0),
            status: usedSeats >= maxSeats ? 'completed' : 'active'
          };
        });

        setSponsorships(mappedSponsorships);

        // Calculate summary
        const totalSeats = mappedSponsorships.reduce((sum, s) => sum + s.usedSeats, 0);
        const totalMaxSeats = mappedSponsorships.reduce((sum, s) => sum + s.maxSeats, 0);
        const totalSpent = mappedSponsorships.reduce((sum, s) => sum + s.totalSpent, 0);
        const activeSponsorships = mappedSponsorships.filter(s => s.status === 'active').length;

        setSummary({
          totalSeatsSupported: totalSeats,
          totalCreditsSpent: creditData?.used_credits || totalSpent,
          remainingCredits: creditData?.available_credits || 0,
          activeSponsorships,
          averageConversion: totalMaxSeats > 0 ? Math.round((totalSeats / totalMaxSeats) * 100) : 0
        });
      }
    } catch (error) {
      console.error('Error loading impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCredits = (amount: number) => {
    return `${amount.toLocaleString('hu-HU')} Ft`;
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <Badge variant="outline" className="border-emerald-300 text-emerald-700 text-xs">
                  {language === 'hu' ? 'Aktív' : 'Active'}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-emerald-700">{summary.totalSeatsSupported}</p>
              <p className="text-sm text-emerald-600/80">
                {language === 'hu' ? 'Támogatott hely' : 'Seats supported'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-5 h-5 text-indigo-600" />
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-3xl font-bold text-indigo-700">{formatCredits(summary.totalCreditsSpent)}</p>
              <p className="text-sm text-indigo-600/80">
                {language === 'hu' ? 'Felhasznált kredit' : 'Credits spent'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Gift className="w-5 h-5 text-amber-600" />
                <Badge variant="outline" className="border-amber-300 text-amber-700 text-xs">
                  {language === 'hu' ? 'Elérhető' : 'Available'}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-amber-700">{formatCredits(summary.remainingCredits)}</p>
              <p className="text-sm text-amber-600/80">
                {language === 'hu' ? 'Maradék kredit' : 'Remaining credits'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <Target className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-700">{summary.averageConversion}%</p>
              <p className="text-sm text-purple-600/80">
                {language === 'hu' ? 'Konverzió' : 'Conversion'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Active Sponsorships List */}
      <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg text-black flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            {language === 'hu' ? 'Aktív Támogatások' : 'Active Sponsorships'}
          </CardTitle>
          <CardDescription>
            {language === 'hu' 
              ? 'Támogatott helyek és hátralévő kvóta programonként'
              : 'Supported seats and remaining quota per program'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sponsorships.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-black/20 mx-auto mb-3" />
              <p className="text-black/50">
                {language === 'hu' 
                  ? 'Még nincs aktív támogatás. Fedezze fel a programokat!'
                  : 'No active sponsorships yet. Explore programs!'}
              </p>
              <Button variant="outline" className="mt-4" size="sm">
                {language === 'hu' ? 'Programok böngészése' : 'Browse Programs'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sponsorships.map((sponsorship, index) => (
                <motion.div
                  key={sponsorship.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-black/[0.02] border border-black/5 hover:bg-black/[0.04] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-black">{sponsorship.contentTitle}</h4>
                      <p className="text-sm text-black/60">{sponsorship.expertName}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={sponsorship.status === 'active' 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                        : 'border-black/20 bg-black/5 text-black/60'
                      }
                    >
                      {sponsorship.status === 'active' 
                        ? (language === 'hu' ? 'Aktív' : 'Active')
                        : (language === 'hu' ? 'Betelt' : 'Filled')}
                    </Badge>
                  </div>

                  {/* Quota Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-black/60">
                        {language === 'hu' ? 'Helyek' : 'Seats'}
                      </span>
                      <span className="font-medium text-black">
                        {sponsorship.usedSeats} / {sponsorship.maxSeats}
                      </span>
                    </div>
                    <Progress 
                      value={(sponsorship.usedSeats / sponsorship.maxSeats) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-black/5">
                    <div>
                      <p className="text-xs text-black/50">
                        {language === 'hu' ? 'Hozzájárulás/hely' : 'Contribution/seat'}
                      </p>
                      <p className="font-semibold text-black">
                        {formatCredits(sponsorship.sponsorContribution)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-black/50">
                        {language === 'hu' ? 'Összes költés' : 'Total spent'}
                      </p>
                      <p className="font-semibold text-emerald-600">
                        {formatCredits(sponsorship.totalSpent)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveImpactDashboard;
