import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PressableButton } from "@/components/ui/PressableButton";
import { Sparkles, Heart, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { StaggerContainer, StaggerItem } from "@/components/ui/StaggerAnimation";
import { LiveNotificationFeed } from "@/components/home/LiveNotificationFeed";

// Story testimonials - MONOCHROME design
const STORY_CARDS = [
  {
    id: 'community',
    title: 'Aktív közösség',
    quote: '"Végre találtam egy helyet, ahol a szomszédaim igazi barátokká váltak."',
    author: 'Tóth Anna',
    role: 'közösségi tag',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    icon: Users,
    borderColor: 'border-l-slate-900',
  },
  {
    id: 'experiences',
    title: 'Felfedezésre váró élmények',
    quote: '"A kovászkenyér kurzuson megtanultam, amit a nagyanyám már elfelejtett."',
    author: 'Kovács Péter',
    role: 'lelkes résztvevő',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    icon: Sparkles,
    borderColor: 'border-l-slate-700',
  },
  {
    id: 'connections',
    title: 'Megvalósult találkozások',
    quote: '"A gyógynövénytúrán ismertem meg a legjobb barátnőmet."',
    author: 'Nagy Eszter',
    role: 'új barátságok',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    icon: Heart,
    borderColor: 'border-l-slate-500',
  },
];

export const CommunityImpactCounter = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="py-12 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header - NO colored badges */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Együtt többre megyünk
          </h2>
          <p className="text-slate-500 mt-3">
            Csatlakozz te is a növekvő közösségünkhöz
          </p>
        </div>

        {/* Story Cards - Monochrome with left border + Stagger */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {STORY_CARDS.map((story) => (
            <StaggerItem key={story.id}>
              <Card className={`bg-white/80 backdrop-blur-sm border-l-4 ${story.borderColor} hover:shadow-lg transition-shadow`}>
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <story.icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <h3 className="font-bold text-slate-900">{story.title}</h3>
                  <p className="text-slate-600 mt-2 text-sm italic">
                    {story.quote}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={story.avatar} />
                      <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                        {story.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{story.author}</p>
                      <p className="text-xs text-slate-400">{story.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Live Notification Feed - Animated */}
        <Card className="p-6 bg-white/90 backdrop-blur-md border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            {/* Pulsing live indicator - BLACK not green */}
            <div className="relative flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-900" />
              <div className="absolute w-2 h-2 rounded-full bg-slate-900 animate-ping" />
            </div>
            <span className="font-semibold text-slate-800">Friss a közösségből</span>
          </div>
          
          {/* Live animated notification stream */}
          <LiveNotificationFeed />
        </Card>

        {/* CTA */}
        <div className="text-center mt-10">
          <PressableButton asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8">
            <Link to="/auth">
              Csatlakozom a közösséghez
            </Link>
          </PressableButton>
        </div>
      </div>
    </section>
  );
};

export default CommunityImpactCounter;
