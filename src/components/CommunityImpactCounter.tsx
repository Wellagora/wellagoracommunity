import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Handshake, Calendar, TrendingUp, Clock, Zap, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, useInView } from "framer-motion";

interface CounterProps {
  end: number;
  duration?: number;
  shouldStart: boolean;
  suffix?: string;
}

const AnimatedCounter = ({ end, duration = 2000, shouldStart, suffix = "" }: CounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for more dynamic feel
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, shouldStart]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Weekly comparison component
const WeeklyComparison = ({ current, previous, label, icon: Icon }: { 
  current: number; 
  previous: number; 
  label: string;
  icon: React.ElementType;
}) => {
  const change = current - previous;
  const percentChange = previous > 0 ? Math.round((change / previous) * 100) : 100;
  const isPositive = change >= 0;
  
  return (
    <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-black/5">
      <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center">
        <Icon className="w-5 h-5 text-black/60" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-black/50">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-black/90 tabular-nums">{current}</span>
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{percentChange}%
          </span>
        </div>
      </div>
    </div>
  );
};

export const CommunityImpactCounter = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Weekly snapshot data
  const weeklySnapshot = {
    knowledgeMinutes: { current: 1847, previous: 1620 },
    connections: { current: 234, previous: 198 },
  };

  const metrics = [
    {
      icon: Users,
      label: t('impact_counter.active_members'),
      value: 2847,
      change: "+18%",
    },
    {
      icon: MessageSquare,
      label: t('impact_counter.shared_ideas'),
      value: 1256,
      change: "+24%",
    },
    {
      icon: Handshake,
      label: t('impact_counter.collaborations'),
      value: 342,
      change: "+31%",
    },
    {
      icon: Calendar,
      label: t('impact_counter.events_held'),
      value: 127,
      change: "+15%",
    },
  ];

  return (
    <section ref={sectionRef} className="py-12 bg-[#FAFAFA] relative">
      {/* Ultra-thin top separator */}
      <div className="absolute top-0 left-0 right-0 h-[0.5px] bg-black/[0.06]" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-black/5 text-black/70 border-black/10 hover:bg-black/10">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            {t('community_pulse.badge') || 'Közösségi Pulzus'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-black mb-3">
            {t('community_pulse.title') || 'Közösségi Pulzus'}
          </h2>
          <p className="text-black/50 max-w-2xl mx-auto font-light">
            {t('community_pulse.subtitle') || 'Élő statisztikák a közösségünk növekedéséről'}
          </p>
        </div>

        {/* Weekly Snapshot - Heti Pillanatkép */}
        <div className="max-w-4xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-xl border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-black/70" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black/80">
                      {t('community_pulse.weekly_snapshot') || 'Heti Pillanatkép'}
                    </h3>
                    <p className="text-sm text-black/50">
                      {t('community_pulse.compared_to_last_week') || 'Az előző 7 naphoz képest'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <WeeklyComparison 
                    current={weeklySnapshot.knowledgeMinutes.current}
                    previous={weeklySnapshot.knowledgeMinutes.previous}
                    label={t('community_pulse.knowledge_minutes') || 'Tudáspercek'}
                    icon={Zap}
                  />
                  <WeeklyComparison 
                    current={weeklySnapshot.connections.current}
                    previous={weeklySnapshot.connections.previous}
                    label={t('community_pulse.connections') || 'Kapcsolódások'}
                    icon={Handshake}
                  />
                </div>

                {/* Milestone Badge */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
                  className="flex items-center justify-center gap-4 mt-5 pt-5 border-t border-black/5"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-lg -z-10" />
                  </div>
                  <div>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 mb-1">
                      {t('impact_counter.milestone_badge') || 'Mérföldkő!'}
                    </Badge>
                    <p className="font-medium text-black/80 text-sm">
                      {t('impact_counter.milestone_100') || '100. tag csatlakozott!'}
                    </p>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Metric Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Card className="relative overflow-hidden group bg-white/80 backdrop-blur-xl border-black/5 rounded-2xl transition-all duration-500 hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 bg-black/5 rounded-full flex items-center justify-center group-hover:bg-black/10 transition-colors">
                      <metric.icon className="w-5 h-5 text-black/60" />
                    </div>
                    <Badge className="bg-black/5 text-black/60 border-black/10 text-xs font-medium">
                      {metric.change}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-bold text-black/90 tabular-nums">
                        <AnimatedCounter end={metric.value} shouldStart={isInView} />
                      </span>
                    </div>
                    <p className="text-sm font-medium text-black/50">{metric.label}</p>
                  </div>
                </CardContent>
                
                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ultra-thin bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-black/[0.06]" />
    </section>
  );
};
