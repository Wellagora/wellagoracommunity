import { useState, useEffect, useRef } from "react";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Ticket, Sparkles, Star, UserPlus, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { Link } from "react-router-dom";

// Mock community members for avatar stack
const MOCK_MEMBERS = [
  { id: 1, name: 'Anna T.', avatar: null, initials: 'AT', color: 'bg-emerald-500' },
  { id: 2, name: 'Péter K.', avatar: null, initials: 'PK', color: 'bg-blue-500' },
  { id: 3, name: 'Eszter N.', avatar: null, initials: 'EN', color: 'bg-purple-500' },
  { id: 4, name: 'Gábor S.', avatar: null, initials: 'GS', color: 'bg-amber-500' },
  { id: 5, name: 'Mária L.', avatar: null, initials: 'ML', color: 'bg-rose-500' },
];

// Mock activity feed
const MOCK_ACTIVITIES = [
  {
    id: 1,
    type: 'new_program',
    icon: Sparkles,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50',
    text: 'Új program: "Kovászkenyér mesterkurzus"',
    actor: 'Kovács István',
    time: '2 órája'
  },
  {
    id: 2,
    type: 'new_members',
    icon: UserPlus,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    text: '+5 új tag csatlakozott a közösséghez',
    actor: null,
    time: 'ma'
  },
  {
    id: 3,
    type: 'review',
    icon: Star,
    iconColor: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    text: '"Fantasztikus túra volt, mindenkinek ajánlom!"',
    actor: 'Tóth Anna',
    time: 'tegnap'
  },
  {
    id: 4,
    type: 'voucher',
    icon: Ticket,
    iconColor: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    text: '8 kupon beváltva a Gyógynövénytúrán',
    actor: null,
    time: 'tegnap'
  },
  {
    id: 5,
    type: 'comment',
    icon: MessageCircle,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    text: 'Új hozzászólás a Kemenceépítés programhoz',
    actor: 'Németh Béla',
    time: '3 órája'
  },
];

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

export const CommunityImpactCounter = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [visibleActivities, setVisibleActivities] = useState(MOCK_ACTIVITIES.slice(0, 3));
  
  const { stats, loading } = useCommunityStats();

  // Rotate activities every 5 seconds for "live" feel
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleActivities(prev => {
        const shuffled = [...MOCK_ACTIVITIES].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      icon: Users,
      label: t('impact_counter.active_members'),
      value: stats.members,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      icon: Sparkles,
      label: t('impact_counter.expert_programs'),
      value: stats.sharedIdeas,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      icon: Ticket,
      label: t('impact_counter.vouchers_redeemed'),
      value: stats.collaborations,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
            {t('community_pulse.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-black">
            {t('community_pulse.title')}
          </h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Csatlakozz te is a régió értékőrző közösségéhez
          </p>
        </div>

        {/* Stats Row with Avatar Stack */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          {/* Active Members with Avatars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <Card className="text-center p-6 bg-white/95 backdrop-blur-md border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                {/* Avatar Stack */}
                <div className="flex justify-center mb-3">
                  <div className="flex -space-x-3">
                    {MOCK_MEMBERS.map((member) => (
                      <Avatar 
                        key={member.id} 
                        className={`w-10 h-10 border-2 border-white ${member.color}`}
                      >
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback className={`${member.color} text-white text-xs font-medium`}>
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                      <span className="text-xs font-semibold text-slate-600">+{stats.members - 5}</span>
                    </div>
                  </div>
                </div>
                <p className="text-4xl font-bold text-black mb-1">
                  {loading ? '...' : <AnimatedCounter end={stats.members} shouldStart={isInView && !loading} />}
                </p>
                <p className="text-slate-600">{t('impact_counter.active_members')}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Expert Programs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="text-center p-6 bg-white/95 backdrop-blur-md border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-4xl font-bold text-black mb-1">
                  {loading ? '...' : <AnimatedCounter end={stats.sharedIdeas} shouldStart={isInView && !loading} />}
                </p>
                <p className="text-slate-600">{t('impact_counter.expert_programs')}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vouchers Redeemed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="text-center p-6 bg-white/95 backdrop-blur-md border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-4xl font-bold text-black mb-1">
                  {loading ? '...' : <AnimatedCounter end={stats.collaborations} shouldStart={isInView && !loading} />}
                </p>
                <p className="text-slate-600">{t('impact_counter.vouchers_redeemed')}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Live Activity Feed */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            {/* Pulsing green dot */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-600">
              Friss a közösségből
            </span>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {visibleActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-lg ${activity.bgColor} flex items-center justify-center shrink-0`}>
                    <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 truncate">
                      {activity.text}
                      {activity.actor && (
                        <span className="text-slate-500"> — {activity.actor}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {activity.time}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Button asChild size="lg" className="bg-black hover:bg-black/90 text-white px-8 py-6 text-base font-medium rounded-full">
            <Link to="/auth">
              Csatlakozom a közösséghez
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunityImpactCounter;
