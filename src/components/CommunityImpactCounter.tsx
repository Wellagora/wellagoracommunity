import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, UserPlus, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// Mock community members for avatar stack
const MOCK_MEMBERS = [
  { id: 1, name: 'Anna T.', initials: 'AT', color: 'bg-emerald-500' },
  { id: 2, name: 'Péter K.', initials: 'PK', color: 'bg-blue-500' },
  { id: 3, name: 'Eszter N.', initials: 'EN', color: 'bg-purple-500' },
  { id: 4, name: 'Gábor S.', initials: 'GS', color: 'bg-amber-500' },
  { id: 5, name: 'Mária L.', initials: 'ML', color: 'bg-rose-500' },
];

// Mock activity feed
const MOCK_ACTIVITIES = [
  {
    id: 1,
    type: 'new_program',
    icon: Sparkles,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50',
    text: 'Új program: "Kemenceépítés alapjai"',
    time: '2 órája'
  },
  {
    id: 2,
    type: 'new_members',
    icon: UserPlus,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    text: '+3 új tag csatlakozott a közösséghez',
    time: 'ma'
  },
  {
    id: 3,
    type: 'review',
    icon: Star,
    iconColor: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    text: '"Csodálatos élmény volt!" — új értékelés',
    time: 'tegnap'
  },
];

// Story testimonials
const STORY_CARDS = [
  {
    id: 'community',
    title: 'Aktív közösség',
    quote: '"Végre találtam egy helyet, ahol a szomszédaim igazi barátokká váltak."',
    author: 'Tóth Anna',
    location: 'Kővágóörs',
    gradient: 'from-emerald-500 to-teal-600',
    hasAvatars: true,
  },
  {
    id: 'experiences',
    title: 'Felfedezésre váró élmények',
    quote: '"A kovászkenyér kurzuson megtanultam, amit a nagyanyám már elfelejtett elmesélni."',
    author: 'Kovács Péter',
    location: 'Révfülöp',
    gradient: 'from-indigo-500 to-purple-600',
    icon: Sparkles,
  },
  {
    id: 'connections',
    title: 'Megvalósult találkozások',
    quote: '"A gyógynövénytúrán ismertem meg a legjobb barátnőmet. Azóta együtt főzünk minden héten."',
    author: 'Nagy Eszter',
    location: 'Mindszentkálla',
    gradient: 'from-rose-500 to-pink-600',
    icon: Heart,
  },
];

export const CommunityImpactCounter = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [visibleActivities, setVisibleActivities] = useState(MOCK_ACTIVITIES);
  
  // Rotate activities every 5 seconds for "live" feel
  useEffect(() => {
    const allActivities = [
      ...MOCK_ACTIVITIES,
      {
        id: 4,
        type: 'new_program',
        icon: Sparkles,
        iconColor: 'text-indigo-500',
        bgColor: 'bg-indigo-50',
        text: 'Új program: "Kovászkenyér mesterkurzus"',
        time: '4 órája'
      },
      {
        id: 5,
        type: 'review',
        icon: Star,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        text: '"Fantasztikus túra volt!" — Szabó Márta',
        time: '2 napja'
      },
    ];
    
    const interval = setInterval(() => {
      setVisibleActivities(() => {
        const shuffled = [...allActivities].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="py-12 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
            {t('community_pulse.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-black">
            Élő közösség a Káli-medencében
          </h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Valódi emberek, valódi történetek
          </p>
        </div>

        {/* Three Story Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {STORY_CARDS.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden bg-white border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                {/* Gradient Header */}
                <div className={`h-24 bg-gradient-to-r ${story.gradient} flex items-center justify-center`}>
                  {story.hasAvatars ? (
                    <div className="flex -space-x-3">
                      {MOCK_MEMBERS.map((member) => (
                        <Avatar 
                          key={member.id} 
                          className="w-10 h-10 border-2 border-white/50"
                        >
                          <AvatarFallback className="bg-white/20 text-white text-xs font-medium">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">+123</span>
                      </div>
                    </div>
                  ) : story.icon ? (
                    <story.icon className="w-12 h-12 text-white/90" />
                  ) : null}
                </div>
                
                <CardContent className="p-5">
                  <h3 className="font-semibold text-lg text-black mb-2">
                    {story.title}
                  </h3>
                  <p className="text-slate-600 text-sm italic leading-relaxed mb-3">
                    {story.quote}
                  </p>
                  <p className="text-slate-400 text-xs">
                    — {story.author}, {story.location}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
