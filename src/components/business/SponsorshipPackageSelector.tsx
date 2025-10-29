import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { CheckCircle, Star, Crown, Award, Sparkles } from 'lucide-react';

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
      case 'bronze': return 'from-amber-50 to-orange-50 border-amber-200';
      case 'silver': return 'from-gray-50 to-slate-50 border-gray-300';
      case 'gold': return 'from-yellow-50 to-amber-50 border-yellow-300';
      case 'diamond': return 'from-purple-50 to-pink-50 border-purple-300';
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
          className={`relative bg-gradient-to-br ${getPackageGradient(key)} ${
            isCurrentPackage(key) ? 'ring-2 ring-primary shadow-lg' : ''
          }`}
        >
          {isCurrentPackage(key) && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-white">
              Jelenlegi csomag
            </Badge>
          )}
          
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-2">
              {getPackageIcon(key)}
            </div>
            <CardTitle className="text-xl">{tier.name}</CardTitle>
            <div className="text-2xl font-bold text-primary">
              {tier.priceHuf.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">HUF</span>
            </div>
            <div className="text-lg font-semibold text-secondary">
              {tier.priceEur} <span className="text-sm font-normal text-muted-foreground">EUR</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {tier.credits} kredit · {tier.idealFor}
            </p>
          </CardHeader>
          
          <CardContent className="pt-4">
            <ul className="space-y-3 mb-6">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className="w-full" 
              variant={isCurrentPackage(key) ? "outline" : "default"}
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