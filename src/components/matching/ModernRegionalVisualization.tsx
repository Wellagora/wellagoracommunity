import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Users, 
  Building2, 
  Landmark, 
  Heart,
  TrendingUp,
  MapPin,
  Sparkles,
  ArrowRight,
  Target
} from "lucide-react";

interface Stakeholder {
  id: string;
  name: string;
  type: 'citizen' | 'business' | 'government' | 'ngo';
  organization?: string;
  location: string;
  region: string;
  city?: string;
  district?: string;
  latitude: number;
  longitude: number;
  bio?: string;
  sustainability_goals?: string[];
  avatar?: string;
  impactScore?: number;
}

interface ModernRegionalVisualizationProps {
  stakeholders: Stakeholder[];
  onStakeholderClick?: (stakeholder: Stakeholder) => void;
}

const ModernRegionalVisualization = ({ 
  stakeholders, 
  onStakeholderClick 
}: ModernRegionalVisualizationProps) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [hoveredStakeholder, setHoveredStakeholder] = useState<string | null>(null);
  const { t } = useLanguage();

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'citizen':
        return {
          icon: Users,
          label: t('matching.type.citizen'),
          color: 'from-emerald-500 to-teal-500',
          bgGlow: 'shadow-emerald-500/20',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/30'
        };
      case 'business':
        return {
          icon: Building2,
          label: t('matching.type.business'),
          color: 'from-blue-500 to-cyan-500',
          bgGlow: 'shadow-blue-500/20',
          textColor: 'text-blue-400',
          borderColor: 'border-blue-500/30'
        };
      case 'government':
        return {
          icon: Landmark,
          label: t('matching.type.government'),
          color: 'from-red-500 to-rose-500',
          bgGlow: 'shadow-red-500/20',
          textColor: 'text-red-400',
          borderColor: 'border-red-500/30'
        };
      case 'ngo':
        return {
          icon: Heart,
          label: t('matching.type.ngo'),
          color: 'from-amber-500 to-orange-500',
          bgGlow: 'shadow-amber-500/20',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/30'
        };
      default:
        return {
          icon: Target,
          label: t('matching.type.other'),
          color: 'from-gray-500 to-slate-500',
          bgGlow: 'shadow-gray-500/20',
          textColor: 'text-gray-400',
          borderColor: 'border-gray-500/30'
        };
    }
  };

  // Group stakeholders by type
  const groupedStakeholders = stakeholders.reduce((acc, stakeholder) => {
    if (!acc[stakeholder.type]) {
      acc[stakeholder.type] = [];
    }
    acc[stakeholder.type].push(stakeholder);
    return acc;
  }, {} as Record<string, Stakeholder[]>);

  const types = ['citizen', 'business', 'government', 'ngo'];
  
  const filteredStakeholders = selectedType 
    ? stakeholders.filter(s => s.type === selectedType)
    : stakeholders;

  // Get district distribution
  const districtCounts = stakeholders.reduce((acc, s) => {
    const district = s.district || s.city || 'Unknown';
    acc[district] = (acc[district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDistricts = Object.entries(districtCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {types.map((type) => {
          const info = getTypeInfo(type);
          const count = groupedStakeholders[type]?.length || 0;
          const Icon = info.icon;
          const isSelected = selectedType === type;

          return (
            <motion.div
              key={type}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? `border-2 ${info.borderColor} shadow-lg ${info.bgGlow}` 
                    : 'border-border/50 hover:border-primary/50'
                }`}
                onClick={() => setSelectedType(isSelected ? null : type)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${info.color} mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{info.label}</p>
                      <p className="text-3xl font-bold">{count}</p>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-primary"
                      />
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${info.textColor}`} />
                    <span className={`text-sm ${info.textColor}`}>
                      {Math.round((count / stakeholders.length) * 100)}% {t('matching.share')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* District Heatmap */}
      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">{t('matching.top_districts')}</h3>
          </div>
          
          <div className="space-y-3">
            {topDistricts.map(([district, count], index) => {
              const percentage = (count / stakeholders.length) * 100;
              return (
                <motion.div
                  key={district}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{district}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {count} {t('matching.stakeholder')} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60 rounded-full"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {selectedType 
              ? `${getTypeInfo(selectedType).label} (${filteredStakeholders.length})`
              : `${t('matching.all_stakeholders')} (${stakeholders.length})`
            }
          </h3>
          {selectedType && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedType(null)}
            >
              {t('matching.show_all')}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredStakeholders.slice(0, 12).map((stakeholder, index) => {
              const info = getTypeInfo(stakeholder.type);
              const Icon = info.icon;
              const isHovered = hoveredStakeholder === stakeholder.id;

              return (
                <motion.div
                  key={stakeholder.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  onHoverStart={() => setHoveredStakeholder(stakeholder.id)}
                  onHoverEnd={() => setHoveredStakeholder(null)}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                      isHovered 
                        ? `border-2 ${info.borderColor} shadow-lg ${info.bgGlow}` 
                        : 'border-border/50'
                    }`}
                    onClick={() => onStakeholderClick?.(stakeholder)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${info.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{stakeholder.name}</h4>
                          {stakeholder.organization && (
                            <p className="text-sm text-muted-foreground truncate">
                              {stakeholder.organization}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {stakeholder.city || stakeholder.location}
                            </span>
                          </div>

                          {stakeholder.impactScore && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Impact</span>
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full bg-gradient-to-r ${info.color}`}
                                    style={{ width: `${stakeholder.impactScore}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium">{stakeholder.impactScore}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isHovered ? 1 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ArrowRight className="w-4 h-4 text-primary" />
                        </motion.div>
                      </div>

                      {stakeholder.sustainability_goals && stakeholder.sustainability_goals.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {stakeholder.sustainability_goals.slice(0, 2).map((goal, i) => (
                            <Badge 
                              key={i} 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {goal}
                            </Badge>
                          ))}
                          {stakeholder.sustainability_goals.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{stakeholder.sustainability_goals.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredStakeholders.length > 12 && (
          <div className="text-center">
            <Button variant="outline" size="lg">
              {t('matching.load_more').replace('{count}', String(filteredStakeholders.length - 12))}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernRegionalVisualization;
