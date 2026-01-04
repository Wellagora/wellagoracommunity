import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Search, CreditCard, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SponsorCreditsOverview from '@/components/sponsor/SponsorCreditsOverview';
import SponsorTransactionHistory from '@/components/sponsor/SponsorTransactionHistory';
import SponsorActiveSponsorships from '@/components/sponsor/SponsorActiveSponsorships';
import { SubscriptionPlanSelector } from '@/components/subscription/SubscriptionPlanSelector';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';

const SponsorDashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { currentSubscription } = useSubscription();
  const [showPackages, setShowPackages] = useState(false);

  // Check if user is a business/sponsor type OR is Super Admin
  const isSponsor = profile?.user_role && ['business', 'government', 'ngo'].includes(profile.user_role);
  const isSuperAdmin = profile?.is_super_admin === true;

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('auth.login_required')}</h2>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-[#007AFF] hover:bg-[#0056b3] text-white"
          >
            {t('auth.login')}
          </Button>
        </div>
      </div>
    );
  }

  // Super Admins can always access
  if (!isSponsor && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('sponsor.access_denied')}</h2>
          <p className="text-slate-600 mb-4">{t('sponsor.sponsor_only')}</p>
          <Button 
            onClick={() => navigate('/iranyitopult')}
            className="bg-[#007AFF] hover:bg-[#0056b3] text-white"
          >
            {t('common.back_to_dashboard')}
          </Button>
        </div>
      </div>
    );
  }

  // Mock stats for clean UI
  const stats = [
    { label: 'Aktív licencek', value: '248', icon: CreditCard, color: 'text-[#007AFF]' },
    { label: 'Közösségi hatás', value: '1,240', icon: Users, color: 'text-emerald-500' },
    { label: 'Beváltási arány', value: '67%', icon: TrendingUp, color: 'text-amber-500' },
    { label: 'Márkaismertség', value: '+23%', icon: BarChart3, color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/iranyitopult')}
              className="mb-4 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back_to_dashboard')}
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Támogatói Központ
            </h1>
            <p className="text-slate-600 mt-2">
              Kövesd nyomon szponzorációid hatását és a közösségi elérést
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/piacer')}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Search className="w-4 h-4 mr-2" />
              Programok böngészése
            </Button>
            <Button
              onClick={() => setShowPackages(true)}
              className="bg-[#007AFF] hover:bg-[#0056b3] text-white shadow-sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Kredit vásárlás
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Credits Overview */}
        <div className="mb-8">
          <SponsorCreditsOverview />
        </div>

        {/* Active Sponsorships */}
        <div className="mb-8">
          <SponsorActiveSponsorships />
        </div>

        {/* Transaction History */}
        <div>
          <SponsorTransactionHistory />
        </div>
      </div>

      {/* Package Selection Dialog */}
      <Dialog open={showPackages} onOpenChange={setShowPackages}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900">
              Válassz csomagot
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <SubscriptionPlanSelector 
              onSelectPlan={(planId) => {
                toast.success('Csomag kiválasztva! Stripe fizetés hamarosan elérhető.');
                setShowPackages(false);
              }}
              currentPlanKey={currentSubscription?.plan?.plan_key}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SponsorDashboardPage;
