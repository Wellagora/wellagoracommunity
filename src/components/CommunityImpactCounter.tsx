import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Handshake, TrendingUp, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, useInView } from "framer-motion";
import { useCommunityStats } from "@/hooks/useCommunityStats";

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

// Sparkline component - minimalist trend visualization
const Sparkline = ({ data, className = "" }: { data: number[]; className?: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className={`w-full h-full ${className}`} viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon
        points={`0,100 ${points} 100,100`}
        fill="url(#sparklineGradient)"
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Demo avatar data for the stack
const DEMO_AVATARS = [
  { name: "AK", image: null },
  { name: "BM", image: null },
  { name: "CS", image: null },
  { name: "DT", image: null },
  { name: "EL", image: null },
  { name: "FK", image: null },
];

// Avatar Stack Component
const AvatarStack = () => {
  return (
    <div className="flex -space-x-3">
      {DEMO_AVATARS.map((avatar, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
            {avatar.image ? (
              <AvatarImage src={avatar.image} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-black text-xs font-medium">
                {avatar.name}
              </AvatarFallback>
            )}
          </Avatar>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium border-2 border-white shadow-sm"
      >
        +89
      </motion.div>
    </div>
  );
};

export const CommunityImpactCounter = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  // Fetch real stats from Supabase
  const { stats, loading } = useCommunityStats();

  // Sparkline data for hover effect (simulated trend data)
  const sparklineData = {
    members: [85, 92, 88, 95, 102, 110, 127],
    ideas: [8, 9, 10, 11, 10, 12, 12],
    collaborations: [65, 72, 78, 75, 82, 85, 89],
    events: [3, 4, 5, 5, 6, 6, 6],
  };

  // Metrics: Aktív tagok, Közösségi Kapcsolódások (vouchers), Szakértői Programok
  const metrics = [
    {
      icon: Handshake,
      label: t('impact_counter.collaborations') || 'Közösségi Kapcsolódások',
      value: stats.collaborations,
      change: "+31%",
      sparkline: sparklineData.collaborations,
    },
    {
      icon: Award,
      label: t('impact_counter.expert_programs') || 'Szakértői Programok',
      value: stats.sharedIdeas,
      change: "+24%",
      sparkline: sparklineData.ideas,
    },
  ];

  return (
    <section ref={sectionRef} className="py-12 bg-[#FFFFFF] relative">
      {/* Ultra-thin top separator */}
      <div className="absolute top-0 left-0 right-0 h-[0.5px] bg-black/[0.06]" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-white text-black border-black/10 hover:bg-white/90 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-black" strokeWidth={1.5} />
            {t('community_pulse.badge') || 'Közösségi Pulzus'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight mb-3">
            {t('community_pulse.title') || 'Közösségi Pulzus'}
          </h2>
          <p className="text-black/50 max-w-2xl mx-auto font-light tracking-wide">
            {t('community_pulse.subtitle') || 'Élő statisztikák a közösségünk növekedéséről'}
          </p>
        </div>

        {/* Primary Metric: Aktív Tagok with Avatar Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Card className="bg-white/95 backdrop-blur-md border-black/[0.05] rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left: Number and Label */}
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-black/[0.08]">
                    <Users className="w-6 h-6 text-black" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black tracking-wide mb-1">
                      {t('impact_counter.active_members') || 'Aktív tagok'}
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl md:text-6xl font-bold text-black tracking-tight tabular-nums">
                        {loading ? '...' : <AnimatedCounter end={stats.members} shouldStart={isInView && !loading} />}
                      </span>
                      <Badge className="bg-white text-black border-black/10 text-sm font-medium">
                        +18%
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right: Avatar Stack */}
                <div className="flex flex-col items-center md:items-end gap-3">
                  <AvatarStack />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary Metric Cards - 2 columns only */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <Card className="relative overflow-hidden group bg-white/95 backdrop-blur-md border-black/[0.05] rounded-2xl transition-all duration-500 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)] hover:scale-[1.02]">
                {/* Sparkline background - appears on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute bottom-0 left-0 right-0 h-16">
                    <Sparkline data={metric.sparkline} />
                  </div>
                </div>
                
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="relative">
                      <div className="relative w-11 h-11 bg-white rounded-full flex items-center justify-center border border-black/[0.08] group-hover:border-black/[0.12] transition-colors">
                        <metric.icon className="w-5 h-5 text-black" strokeWidth={1.2} />
                      </div>
                    </div>
                    <Badge className="bg-white text-black border-black/[0.08] text-xs font-medium">
                      {metric.change}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-bold text-black tracking-tight tabular-nums">
                        {loading ? '...' : <AnimatedCounter end={metric.value} shouldStart={isInView && !loading} />}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-black tracking-wide">{metric.label}</p>
                  </div>
                </CardContent>
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
