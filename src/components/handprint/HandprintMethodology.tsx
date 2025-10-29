import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BookOpen, 
  Calculator, 
  TreePine, 
  Award,
  Zap,
  Car,
  Utensils,
  Trash2,
  Droplet,
  Users,
  TrendingUp
} from 'lucide-react';

const HandprintMethodology = () => {
  const { t } = useLanguage();

  const methodologyData = [
    {
      category: 'energy',
      icon: Zap,
      factor: '0.4 kg CO₂/kWh',
      source: 'IEA 2023',
      description: 'handprint.methodology.energy_desc',
      color: 'text-warning'
    },
    {
      category: 'transport',
      icon: Car,
      factor: '0.21 kg CO₂/km',
      source: 'EPA 2023',
      description: 'handprint.methodology.transport_desc',
      color: 'text-primary'
    },
    {
      category: 'food',
      icon: Utensils,
      factor: '2.5 kg CO₂/meal',
      source: 'FAO 2022',
      description: 'handprint.methodology.food_desc',
      color: 'text-success'
    },
    {
      category: 'waste',
      icon: Trash2,
      factor: '2.1 kg CO₂/kg',
      source: 'EPA 2023',
      description: 'handprint.methodology.waste_desc',
      color: 'text-destructive'
    },
    {
      category: 'water',
      icon: Droplet,
      factor: '0.4 g CO₂/L',
      source: 'Water Footprint Network',
      description: 'handprint.methodology.water_desc',
      color: 'text-info'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            {t('handprint.methodology.title')}
          </CardTitle>
          <CardDescription>
            {t('handprint.methodology.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('handprint.methodology.intro')}
          </p>
          
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TreePine className="w-5 h-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  {t('handprint.methodology.tree_standard')}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t('handprint.methodology.tree_standard_desc')}
                </p>
                <Badge variant="outline" className="mt-2">
                  1 {t('common.tree')} = 21.77 kg CO₂/{t('common.year')}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            {t('handprint.methodology.conversion_factors')}
          </CardTitle>
          <CardDescription>
            {t('handprint.methodology.factors_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {methodologyData.map((item, index) => {
              const Icon = item.icon;
              return (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${item.color}`} />
                      <div className="text-left">
                        <div className="font-semibold capitalize">{t(`handprint.category.${item.category}`)}</div>
                        <div className="text-xs text-muted-foreground">{item.factor}</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-3">
                    <p className="text-sm text-muted-foreground">
                      {t(item.description)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {t('handprint.methodology.source')}: {item.source}
                      </Badge>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-xs">
                      <span className="font-medium">{t('handprint.methodology.calculation_example')}: </span>
                      <span className="text-muted-foreground">
                        {t(`handprint.methodology.example.${item.category}`)}
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Multipliers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t('handprint.methodology.multipliers_title')}
          </CardTitle>
          <CardDescription>
            {t('handprint.methodology.multipliers_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
              <Users className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">{t('handprint.methodology.community_effect')}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('handprint.methodology.community_effect_desc')}
                </p>
                <div className="mt-2 text-xs">
                  <span className="font-mono bg-background px-2 py-1 rounded">
                    {t('handprint.methodology.formula')}: Base × (1 + 0.05 × {t('handprint.methodology.activities')})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg">
              <Award className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">{t('handprint.methodology.streak_bonus')}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('handprint.methodology.streak_bonus_desc')}
                </p>
                <div className="mt-2 text-xs">
                  <span className="font-mono bg-background px-2 py-1 rounded">
                    {t('handprint.methodology.formula')}: Base × (1 + 0.1 × {t('handprint.methodology.streak_days')})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation & Accuracy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {t('handprint.methodology.validation_title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('handprint.methodology.validation_intro')}
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>{t('handprint.methodology.validation_1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>{t('handprint.methodology.validation_2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>{t('handprint.methodology.validation_3')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>{t('handprint.methodology.validation_4')}</span>
            </li>
          </ul>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs">
            <p className="font-medium mb-1">{t('handprint.methodology.disclaimer_title')}</p>
            <p className="text-muted-foreground">
              {t('handprint.methodology.disclaimer_text')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HandprintMethodology;
