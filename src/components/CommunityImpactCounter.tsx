import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Handshake, Calendar, TrendingUp, Target, Trophy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, useInView } from "framer-motion";

interface CounterProps {
  end: number;
  duration?: number;
  shouldStart: boolean;
}

const AnimatedCounter = ({ end, duration = 2000, shouldStart }: CounterProps) => {
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

  return <span>{count.toLocaleString()}</span>;
};

// Progress bar component for goals
const GoalProgress = ({ current, target, label }: { current: number; target: number; label: string }) => {
  const percentage = Math.min((current / target) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-black/70">{label}</span>
        <span className="text-black/50">{current}/{target}</span>
      </div>
      <div className="h-2 bg-black/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-black via-black/80 to-black/60 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
        />
      </div>
    </div>
  );
};

export const CommunityImpactCounter = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

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

  // Goal data
  const monthlyGoal = { current: 38, target: 50 };

  return (
    <section ref={sectionRef} className="py-16 bg-[#FAFAFA] relative">
      {/* Ultra-thin top separator */}
      <div className="absolute top-0 left-0 right-0 h-[0.5px] bg-black/[0.06]" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-black/5 text-black/70 border-black/10 hover:bg-black/10">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            {t('impact_counter.badge')}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-black mb-3">
            {t('impact_counter.title')}
          </h2>
          <p className="text-black/50 max-w-2xl mx-auto font-light">
            {t('impact_counter.subtitle')}
          </p>
        </div>

        {/* Gamification: Goal Progress + Milestone */}
        <div className="max-w-4xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-xl border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Goal Progress */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                        <Target className="w-5 h-5 text-black/70" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-black/80">{t('impact_counter.goal_title')}</h3>
                        <p className="text-sm text-black/50">{monthlyGoal.target} {t('impact_counter.goal_subtitle')}</p>
                      </div>
                    </div>
                    <GoalProgress 
                      current={monthlyGoal.current} 
                      target={monthlyGoal.target} 
                      label={`${Math.round((monthlyGoal.current / monthlyGoal.target) * 100)}%`}
                    />
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-[1px] h-20 bg-black/5" />

                  {/* Milestone Badge */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
                    className="flex items-center gap-4"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl -z-10" />
                    </div>
                    <div>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 mb-1">
                        {t('impact_counter.milestone_badge')}
                      </Badge>
                      <p className="font-medium text-black/80">{t('impact_counter.milestone_100')}</p>
                    </div>
                  </motion.div>
                </div>
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
