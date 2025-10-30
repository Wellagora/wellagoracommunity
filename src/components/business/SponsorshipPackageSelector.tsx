import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, Crown, Award, Sparkles } from 'lucide-react';

const SponsorshipPackageSelector: React.FC = () => {
  const { packageTiers, createCheckout, subscription } = useSubscription();
  const { t } = useLanguage();

  const getPackageIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Award className="w-10 h-10 text-amber-500" strokeWidth={2.5} />;
      case 'silver': return <Star className="w-10 h-10 text-slate-400" strokeWidth={2.5} />;
      case 'gold': return <Crown className="w-10 h-10 text-yellow-400" strokeWidth={2.5} />;
      case 'diamond': return <Sparkles className="w-10 h-10 text-purple-400" strokeWidth={2.5} />;
      default: return <Award className="w-10 h-10" />;
    }
  };

  const getPackageGradient = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-orange-500 via-amber-400 to-orange-600';
      case 'silver': return 'from-slate-400 via-gray-300 to-slate-500';
      case 'gold': return 'from-yellow-400 via-amber-300 to-yellow-500';
      case 'diamond': return 'from-purple-500 via-pink-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getBackgroundGradient = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950/40 dark:via-amber-950/40 dark:to-orange-900/40';
      case 'silver': return 'from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950/40 dark:via-gray-950/40 dark:to-slate-900/40';
      case 'gold': return 'from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-950/40 dark:via-amber-950/40 dark:to-yellow-900/40';
      case 'diamond': return 'from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950/40 dark:via-pink-950/40 dark:to-purple-900/40';
      default: return 'from-gray-50 to-gray-100';
    }
  };

  const isCurrentPackage = (tier: string) => {
    return subscription?.subscribed && subscription.package_level === tier;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
        <p className="text-blue-900 dark:text-blue-100">
          <strong>{t('sponsor.important')}:</strong> {t('sponsor.credit_explanation')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Object.entries(packageTiers).map(([key, tier]) => (
        <Card 
          key={key} 
          className={`relative overflow-hidden bg-gradient-to-br ${getBackgroundGradient(key)} border-2 ${
            isCurrentPackage(key) ? 'ring-4 ring-primary ring-offset-2' : 'border-transparent'
          } hover:scale-105 hover:shadow-2xl transition-all duration-300 group`}
        >
          {isCurrentPackage(key) && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-success text-white z-10 shadow-lg">
              {t('sponsor.current_package')}
            </Badge>
          )}
          
          {/* Animated Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getPackageGradient(key)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
          
          <CardHeader className="text-center pb-4 relative z-10">
            <div className="flex justify-center mb-4 animate-fade-in">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${getPackageGradient(key)} shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                {getPackageIcon(key)}
              </div>
            </div>
            <CardTitle className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 group-hover:scale-105 transition-transform duration-200">{tier.name}</CardTitle>
            <div className="space-y-1 sm:space-y-2">
              <div className={`text-2xl sm:text-4xl font-extrabold bg-gradient-to-r ${getPackageGradient(key)} bg-clip-text text-transparent animate-fade-in`}>
                {tier.priceHuf.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">HUF</div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {tier.priceEur} <span className="text-sm sm:text-base text-muted-foreground">EUR</span>
              </div>
              <div className={`inline-block px-3 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r ${getPackageGradient(key)} rounded-full mt-2 sm:mt-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                <p className="text-sm sm:text-base font-bold text-white">
                  {tier.credits} {t('sponsor.credits')}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-3 sm:pt-4 relative z-10">
            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 min-h-[160px] sm:min-h-[200px]">
              {tier.features.map((feature, index) => (
                <li key={index} className="text-xs sm:text-sm font-medium flex items-start group/item hover:translate-x-1 transition-transform duration-200">
                  <span className={`bg-gradient-to-r ${getPackageGradient(key)} bg-clip-text text-transparent font-bold mr-1.5 sm:mr-2 text-base sm:text-lg flex-shrink-0`}>✓</span>
                  <span className="text-gray-900 dark:text-gray-100">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className={`w-full h-10 sm:h-12 font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 ${
                isCurrentPackage(key) 
                  ? `bg-gradient-to-r ${getPackageGradient(key)} text-white` 
                  : `bg-gradient-to-r ${getPackageGradient(key)} text-white hover:scale-105`
              }`}
              disabled={isCurrentPackage(key)}
              onClick={() => {
                if (!isCurrentPackage(key)) {
                  createCheckout(tier.price_id);
                }
              }}
            >
              {isCurrentPackage(key) ? `✓ ${t('sponsor.active_package')}` : `${t('sponsor.choose_package')} →`}
            </Button>
          </CardContent>
        </Card>
        ))}
      </div>
    </div>
  );
};

export default SponsorshipPackageSelector;