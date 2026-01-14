import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Ticket, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, useInView } from "framer-motion";
import { useCommunityStats } from "@/hooks/useCommunityStats";

interface CounterProps {
  end: number;
  duration?: number;
  shouldStart: boolean;
}

const AnimatedCounter = ({ end, duration = 2000, shouldStart }: CounterProps) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!shouldStart) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
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

import React from "react";

export const CommunityImpactCounter = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const { stats, loading } = useCommunityStats();

  const metrics = [
    {
      icon: Users,
      label: t('impact_counter.active_members'),
      value: stats.members,
      color: "text-emerald-600",
    },
    {
      icon: Ticket,
      label: t('impact_counter.vouchers_redeemed'),
      value: stats.collaborations,
      color: "text-amber-600",
    },
    {
      icon: Sparkles,
      label: t('impact_counter.expert_programs'),
      value: stats.sharedIdeas,
      color: "text-indigo-600",
    },
  ];

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
            {t('community_pulse.badge')}
          </span>
          <h2 className="text-3xl font-bold mt-2 text-black">
            {t('community_pulse.title')}
          </h2>
        </div>

        {/* 3 Clean Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="text-center p-6 bg-white/95 backdrop-blur-md border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <metric.icon className={`w-10 h-10 mx-auto ${metric.color} mb-3`} />
                  <p className="text-4xl font-bold text-black mb-1">
                    {loading ? '...' : <AnimatedCounter end={metric.value} shouldStart={isInView && !loading} />}
                  </p>
                  <p className="text-slate-600">{metric.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
