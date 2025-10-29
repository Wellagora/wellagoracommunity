import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Star, Crown, Award, Sparkles } from 'lucide-react';

const SponsorshipPackageSelector: React.FC = () => {
  const { packageTiers, createCheckout, subscription } = useSubscription();

  const getPackageIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Award className="w-6 h-6 text-amber-600" />;
      case 'silver': return <Star className="w-6 h-6 text-gray-500" />;
      case 'gold': return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'diamond': return <Sparkles className="w-6 h-6 text-purple-500" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const getPackageGradient = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-orange-400/20 via-amber-500/20 to-orange-400/20 border-amber-400/50 shadow-lg shadow-amber-500/20';
      case 'silver': return 'from-slate-400/20 via-gray-300/20 to-slate-400/20 border-slate-400/50 shadow-lg shadow-slate-400/20';
      case 'gold': return 'from-yellow-400/20 via-amber-300/20 to-yellow-400/20 border-yellow-400/50 shadow-lg shadow-yellow-500/20';
      case 'diamond': return 'from-purple-400/20 via-pink-400/20 to-purple-400/20 border-purple-400/50 shadow-lg shadow-purple-500/20';
      default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const isCurrentPackage = (tier: string) => {
    return subscription?.subscribed && subscription.package_level === tier;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
        <p className="text-blue-900 dark:text-blue-100">
          <strong>Fontos:</strong> 1 kredit = 1 hónap kampánytámogatás. A krediteket rugalmasan használhatod fel különböző kihívások szponzorálására.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(packageTiers).map(([key, tier]) => (
        <Card 
          key={key} 
          className={`relative overflow-hidden bg-gradient-to-br ${getPackageGradient(key)} ${
            isCurrentPackage(key) ? 'ring-2 ring-primary' : ''
          } hover:scale-105 transition-all duration-300`}
        >
          {isCurrentPackage(key) && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-white">
              Jelenlegi csomag
            </Badge>
          )}
          
          <CardHeader className="text-center pb-2 relative z-10">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-success/20">
                {getPackageIcon(key)}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold mb-2">{tier.name}</CardTitle>
            <div className="space-y-1">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                {tier.priceHuf.toLocaleString()} <span className="text-xl">HUF</span>
              </div>
              <div className="text-xl font-semibold text-foreground">
                {tier.priceEur} <span className="text-base">EUR</span>
              </div>
              <div className="inline-block px-4 py-1 bg-gradient-to-r from-primary to-success rounded-full mt-2">
                <p className="text-sm font-bold text-white">
                  {tier.credits} kredit
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4 relative z-10">
            <ul className="space-y-2 mb-6 min-h-[200px]">
              {tier.features.map((feature, index) => (
                <li key={index} className="text-sm font-medium text-foreground flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className={`w-full font-bold ${
                isCurrentPackage(key) 
                  ? 'bg-gradient-to-r from-success to-primary' 
                  : 'bg-gradient-to-r from-primary to-success hover:shadow-xl'
              }`}
              disabled={isCurrentPackage(key)}
              onClick={() => {
                if (!isCurrentPackage(key)) {
                  createCheckout(tier.price_id);
                }
              }}
            >
              {isCurrentPackage(key) ? 'Aktív csomag' : 'Csomag választása'}
            </Button>
          </CardContent>
        </Card>
        ))}
      </div>
    </div>
  );
};

export default SponsorshipPackageSelector;