import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const RegionalSponsorshipTab = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-warning/10 to-success/10 border-warning/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Building2 className="w-12 h-12 text-warning flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">{t('regional.sponsorship_title')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('regional.sponsorship_desc')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-success/20 text-success">{t('regional.brand_awareness')}</Badge>
                <Badge className="bg-primary/20 text-primary">{t('regional.esg_reports')}</Badge>
                <Badge className="bg-accent/20 text-accent">{t('regional.community_impact')}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bronze Package */}
        <Card className="border-2 border-amber-500/20 hover:border-amber-500/40 transition-all">
          <CardHeader>
            <Badge className="bg-amber-500/10 text-amber-600 w-fit">{t('regional.package_bronze')}</Badge>
            <CardTitle className="text-2xl mt-2">{t('regional.package_bronze_price')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('regional.package_bronze_price_sub')}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="text-sm flex items-start">
                <span className="text-success mr-2">✓</span>
                {t('regional.package_bronze_feature1')}
              </li>
              <li className="text-sm flex items-start">
                <span className="text-success mr-2">✓</span>
                {t('regional.package_bronze_feature2')}
              </li>
              <li className="text-sm flex items-start">
                <span className="text-success mr-2">✓</span>
                {t('regional.package_bronze_feature3')}
              </li>
            </ul>
            <Button className="w-full">{t('regional.choose_button')}</Button>
          </CardContent>
        </Card>

        {/* Silver Package */}
        <Card className="border-2 border-gray-400/20 hover:border-gray-400/40 transition-all">
          <CardHeader>
            <Badge className="bg-gray-400/10 text-gray-600 w-fit">{t('regional.package_silver')}</Badge>
            <CardTitle className="text-2xl mt-2">{t('regional.package_silver_price')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('regional.package_silver_price_sub')}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="text-sm flex items-start">
                <span className="text-success mr-2">✓</span>
                {t('regional.package_silver_feature1')}
              </li>
              <li className="text-sm flex items-start">
                <span className="text-success mr-2">✓</span>
                {t('regional.package_silver_feature2')}
              </li>
              <li className="text-sm flex items-start">
                <span className="text-success mr-2">✓</span>
                {t('regional.package_silver_feature3')}
              </li>
            </ul>
            <Button className="w-full bg-gray-600 hover:bg-gray-700">{t('regional.choose_button')}</Button>
          </CardContent>
        </Card>

        {/* Gold Package */}
        <Card className="border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
          <CardHeader>
            <Badge className="bg-yellow-500/10 text-yellow-600 w-fit">{t('regional.package_gold')}</Badge>
            <CardTitle className="text-2xl mt-2">{t('regional.package_gold_price')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('regional.package_gold_price_sub')}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="text-sm flex items-start">
                <span className="text-success mr-2">✓</span>
                {t('regional.package_gold_feature1')}
              </li>
              <li className="text-sm flex items-start">
                <span className="text-success mr-2">✓</span>
                {t('regional.package_gold_feature2')}
              </li>
              <li className="text-sm flex items-start">
                <span className="text-success mr-2">✓</span>
                {t('regional.package_gold_feature3')}
              </li>
            </ul>
            <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
              {t('regional.choose_button')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('regional.impact_calculator')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">{t('regional.expected_reach')}</p>
              <p className="text-2xl font-bold text-primary">{t('regional.expected_reach_value')}</p>
              <p className="text-xs text-muted-foreground">{t('regional.expected_reach_unit')}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">{t('regional.co2_savings')}</p>
              <p className="text-2xl font-bold text-success">{t('regional.co2_savings_value')}</p>
              <p className="text-xs text-muted-foreground">{t('regional.co2_savings_unit')}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">{t('regional.brand_awareness_calc')}</p>
              <p className="text-2xl font-bold text-accent">{t('regional.brand_awareness_value')}</p>
              <p className="text-xs text-muted-foreground">{t('regional.brand_awareness_unit')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
