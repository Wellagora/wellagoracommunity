import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Coins, UserPlus, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUserBalance } from '@/lib/wellpoints';
import { toast } from 'sonner';

const CommunityCTA = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Fetch user's WellPoints balance
  const { data: balance } = useQuery({
    queryKey: ['wellpoints-balance', user?.id],
    queryFn: () => getUserBalance(user?.id || ''),
    enabled: !!user?.id,
  });

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`https://wellagora.org/invite/${user?.id}`);
    toast.success(t('referral.link_copied'));
  };

  // Logged-out user: Show join CTA
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHptMjQgMGgxMnYxMkg4NHptMjQgMGgxMnYxMkgxMDh6bTI0IDBoMTJ2MTJIMTMyem0yNCAwaDEydjEySDE1NnptMjQgMGgxMnYxMkgxODB6bTI0IDBoMTJ2MTJIMjA0em0yNCAwaDEydjEySDIyOHptMjQgMGgxMnYxMkgyNTJ6bTI0IDBoMTJ2MTJIMjc2em0yNCAwaDEydjEySDMwMHptMjQgMGgxMnYxMkgzMjR6bTI0IDBoMTJ2MTJIMzQ4em0yNCAwaDEydjEySDM3MnptMjQgMGgxMnYxMkgzOTZ6bTI0IDBoMTJ2MTJINDIwem0yNCAwaDEydjEySDQ0NHptMjQgMGgxMnYxMkg0Njh6bTI0IDBoMTJ2MTJINDkyem0yNCAwaDEydjEySDUxNnptMjQgMGgxMnYxMkg1NDB6bTI0IDBoMTJ2MTJINTY0em0yNCAwaDEydjEySDU4OHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10" />
          
          <div className="relative p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t('community.join_title')}
            </h2>
            
            <p className="text-lg text-white/80 mb-8 max-w-2xl">
              {t('community.join_subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 gap-2"
                onClick={() => navigate('/auth')}
              >
                {t('community.register')}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                onClick={() => navigate('/programs')}
              >
                {t('community.explore_programs')}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Logged-in user: Show WellPoints + Referral cards
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* WellPoints Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMTM0aDEydjEySDM2em0yNCAwaDEydjEySDYwem0yNCAwaDEydjEySDg0em0yNCAwaDEydjEySDEwOHptMjQgMGgxMnYxMkgxMzJ6bTI0IDBoMTJ2MTJIMTU2em0yNCAwaDEydjEySDE4MHptMjQgMGgxMnYxMkgyMDR6bTI0IDBoMTJ2MTJIMjI4em0yNCAwaDEydjEySDI1MnptMjQgMGgxMnYxMkgyNzZ6bTI0IDBoMTJ2MTJIMzAwem0yNCAwaDEydjEySDMyNHptMjQgMGgxMnYxMkgzNDh6bTI0IDBoMTJ2MTJIMzcyem0yNCAwaDEydjEySDM5NnptMjQgMGgxMnYxMkg0MjB6bTI0IDBoMTJ2MTJINDQ0em0yNCAwaDEydjEySDQ2OHptMjQgMGgxMnYxMkg0OTJ6bTI0IDBoMTJ2MTJINTE2em0yNCAwaDEydjEySDU0MHptMjQgMGgxMnYxMkg1NjR6bTI0IDBoMTJ2MTJINTg4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
        
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-white/80">{t('wallet.your_balance')}</p>
              <p className="text-3xl font-bold">{balance || 0} WP</p>
            </div>
          </div>

          <Button
            className="w-full bg-white text-amber-600 hover:bg-white/90"
            onClick={() => navigate('/dashboard?tab=wallet')}
          >
            {t('wallet.view_wallet')}
          </Button>
        </div>
      </Card>

      {/* Referral Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMTM0aDEydjEySDM2em0yNCAwaDEydjEySDYwem0yNCAwaDEydjEySDg0em0yNCAwaDEydjEySDEwOHptMjQgMGgxMnYxMkgxMzJ6bTI0IDBoMTJ2MTJIMTU2em0yNCAwaDEydjEySDE4MHptMjQgMGgxMnYxMkgyMDR6bTI0IDBoMTJ2MTJIMjI4em0yNCAwaDEydjEySDI1MnptMjQgMGgxMnYxMkgyNzZ6bTI0IDBoMTJ2MTJIMzAwem0yNCAwaDEydjEySDMyNHptMjQgMGgxMnYxMkgzNDh6bTI0IDBoMTJ2MTJIMzcyem0yNCAwaDEydjEySDM5NnptMjQgMGgxMnYxMkg0MjB6bTI0IDBoMTJ2MTJINDQ0em0yNCAwaDEydjEySDQ2OHptMjQgMGgxMnYxMkg0OTJ6bTI0IDBoMTJ2MTJINTE2em0yNCAwaDEydjEySDU0MHptMjQgMGgxMnYxMkg1NjR6bTI0IDBoMTJ2MTJINTg4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
        
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-full">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">{t('referral.grow_community')}</h3>
          </div>

          <p className="text-sm text-white/90 mb-4">
            {t('referral.invite_bonus')}
          </p>

          <Button
            className="w-full bg-white text-emerald-600 hover:bg-white/90"
            onClick={copyReferralLink}
          >
            {t('referral.copy_link')}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default CommunityCTA;
