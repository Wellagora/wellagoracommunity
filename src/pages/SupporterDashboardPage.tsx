import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  DollarSign, 
  BookOpen, 
  Users, 
  Plus, 
  FileDown, 
  Gift,
} from 'lucide-react';
import SponsorCreditsOverview from '@/components/sponsor/SponsorCreditsOverview';
import SponsorTransactionHistory from '@/components/sponsor/SponsorTransactionHistory';

const SupporterDashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const isSponsor = profile?.user_role && ['business', 'government', 'ngo'].includes(profile.user_role);

  // Fetch sponsored contents
  const { data: sponsoredContents } = useQuery({
    queryKey: ['sponsoredContents', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_contents')
        .select(`
          id, title, price_huf, total_licenses, used_licenses,
          creator:profiles!expert_contents_creator_id_fkey(first_name, last_name, avatar_url)
        `)
        .eq('sponsor_id', user?.id)
        .eq('access_type', 'sponsored');
      if (error) throw error;
      return data;
    },
    enabled: !!user && isSponsor,
  });

  // Fetch transactions
  const { data: transactions } = useQuery({
    queryKey: ['sponsorTransactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('buyer_id', user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user && isSponsor,
  });

  const totalSpent = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const totalImpact = sponsoredContents?.reduce((sum, c) => sum + (c.used_licenses || 0), 0) || 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('auth.login_required')}</h2>
          <Button onClick={() => navigate('/auth')}>{t('auth.login')}</Button>
        </div>
      </div>
    );
  }

  if (!isSponsor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('supporter.access_denied')}</h2>
          <Button onClick={() => navigate('/dashboard')}>{t('common.back_to_dashboard')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-[#FFD700]/20">
              <Building2 className="h-8 w-8 text-[#FFD700]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('supporter.title')}</h1>
              <p className="text-muted-foreground">{t('supporter.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Impact Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-[#FFD700]" />
              <div>
                <p className="text-2xl font-bold">{totalSpent.toLocaleString()} Ft</p>
                <p className="text-sm text-muted-foreground">{t('supporter.total_spent')}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-[#00E5FF]" />
              <div>
                <p className="text-2xl font-bold">{sponsoredContents?.length || 0}</p>
                <p className="text-sm text-muted-foreground">{t('supporter.sponsored_guides')}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalImpact}</p>
                <p className="text-sm text-muted-foreground">{t('supporter.people_reached')}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button 
            className="bg-[#FFD700] text-black hover:bg-[#FFD700]/80"
            onClick={() => navigate('/piacer')}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('supporter.sponsor_new')}
          </Button>
          
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            {t('supporter.download_report')}
          </Button>
        </div>

        {/* Sponsored Contents */}
        <Card className="p-6 bg-card border-border mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('supporter.my_sponsorships')}</h2>
          
          {!sponsoredContents || sponsoredContents.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg">{t('supporter.no_sponsorships')}</p>
              <p className="text-muted-foreground mb-4">{t('supporter.no_sponsorships_desc')}</p>
              <Button className="bg-[#FFD700] text-black" onClick={() => navigate('/piacer')}>
                {t('supporter.browse_guides')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sponsoredContents.map(content => {
                const usedPercent = content.total_licenses ? (content.used_licenses || 0) / content.total_licenses * 100 : 0;
                return (
                  <div key={content.id} className="p-4 bg-[#112240] rounded-lg border border-[#FFD700]/20">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{content.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {content.creator?.first_name} {content.creator?.last_name}
                        </p>
                      </div>
                      <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                        {content.used_licenses || 0} / {content.total_licenses || 0}
                      </Badge>
                    </div>
                    <Progress value={usedPercent} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(usedPercent)}% {t('supporter.utilized')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <SponsorTransactionHistory />
      </div>
    </div>
  );
};

export default SupporterDashboardPage;