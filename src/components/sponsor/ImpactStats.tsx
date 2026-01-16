import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Leaf, BookOpen, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImpactStatsProps {
  peopleHelped: number;
  topCategories: { name: string; count: number }[];
  carbonHandprint: number;
  totalProgramsSupported: number;
}

const ImpactStats = ({
  peopleHelped,
  topCategories,
  carbonHandprint,
  totalProgramsSupported
}: ImpactStatsProps) => {
  const { language } = useLanguage();

  const stats = [
    {
      label: language === 'hu' ? 'Támogatott emberek' : 'People Helped',
      value: peopleHelped,
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      suffix: ''
    },
    {
      label: language === 'hu' ? 'Programok' : 'Programs',
      value: totalProgramsSupported,
      icon: BookOpen,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      suffix: ''
    },
    {
      label: language === 'hu' ? 'CO₂ Lábnyom Csökkentés' : 'Carbon Handprint',
      value: carbonHandprint,
      icon: Leaf,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      suffix: ' kg'
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-black">
          <Award className="w-5 h-5 text-amber-500" />
          {language === 'hu' ? 'Hatás Statisztikák' : 'Impact Statistics'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-3 rounded-xl bg-black/[0.02] border border-black/5"
            >
              <div className={`inline-flex p-2 rounded-full ${stat.bgColor} mb-2`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-black">
                {stat.value.toLocaleString()}{stat.suffix}
              </p>
              <p className="text-xs text-black/50 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Top Categories */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-black">
              {language === 'hu' ? 'Top Kategóriák' : 'Top Categories'}
            </p>
            <TrendingUp className="w-4 h-4 text-black/40" />
          </div>
          
          {topCategories.length > 0 ? (
            <div className="space-y-2">
              {topCategories.slice(0, 3).map((category, index) => (
                <div 
                  key={category.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-black/[0.02]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-black/40">#{index + 1}</span>
                    <span className="text-sm text-black">{category.name}</span>
                  </div>
                  <Badge variant="outline" className="border-black/10 text-black/60 text-xs">
                    {category.count} {language === 'hu' ? 'fő' : 'people'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-black/40">
                {language === 'hu' 
                  ? 'Kategória adatok hamarosan'
                  : 'Category data coming soon'}
              </p>
            </div>
          )}
        </div>

        {/* Carbon Handprint Highlight */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-white shadow-sm">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-700">
                {language === 'hu' ? 'Karbon Lábnyom Pozitív Hatás' : 'Carbon Handprint Impact'}
              </p>
              <p className="text-2xl font-bold text-green-800">
                {carbonHandprint.toLocaleString()} kg CO₂
              </p>
              <p className="text-xs text-green-600 mt-1">
                {language === 'hu' 
                  ? '≈ ' + Math.round(carbonHandprint / 22) + ' fa éves hatása'
                  : '≈ ' + Math.round(carbonHandprint / 22) + ' trees yearly impact'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactStats;
