import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";

// Hard-coded expert data - always visible on homepage
const EXPERTS = [
  {
    id: "expert-1",
    first_name: "Kovács",
    last_name: "János",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    expert_title: "Sajtmester",
    location_city: "Káli-medence",
    is_verified_expert: true,
  },
  {
    id: "expert-2",
    first_name: "Bécsi",
    last_name: "Anna",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    expert_title: "Restaurátor",
    location_city: "Budapest",
    is_verified_expert: true,
  },
  {
    id: "expert-3",
    first_name: "Nagy",
    last_name: "Péter",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    expert_title: "Asztalosmester",
    location_city: "Tihany",
    is_verified_expert: true,
  },
  {
    id: "expert-4",
    first_name: "Szabó",
    last_name: "Eszter",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    expert_title: "Permakultúra szakértő",
    location_city: "Balaton-felvidék",
    is_verified_expert: false,
  },
  {
    id: "expert-5",
    first_name: "Tóth",
    last_name: "Gábor",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    expert_title: "Pálinkafőző mester",
    location_city: "Tokaj",
    is_verified_expert: true,
  },
];

const ExpertGallery = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-wide" style={{ letterSpacing: '0.02em' }}>
              {t('home.experts_title')}
            </h2>
            <p className="text-slate-600 mt-1">
              {t('home.experts_subtitle')}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("left")}
              className="rounded-full bg-white shadow-sm hover:shadow-md transition-shadow border border-slate-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("right")}
              className="rounded-full bg-white shadow-sm hover:shadow-md transition-shadow border border-slate-100"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Link to="/piacer" className="ml-4">
              <Button variant="ghost" className="gap-2 text-[#34C759] hover:text-[#2DB14E] hover:bg-green-50 font-medium">
                {t('home.view_all')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Expert Slider */}
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {EXPERTS.map((expert, index) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              style={{ scrollSnapAlign: "start" }}
            >
              <Link
                to={`/piacer?creator=${expert.id}`}
                className="flex flex-col items-center text-center group w-48 flex-shrink-0"
              >
                {/* Circular Portrait with 2px white border and 3D shadow */}
                <div className="relative">
                  <Avatar 
                    className="w-36 h-36 border-2 border-white group-hover:scale-105 transition-all duration-300"
                    style={{
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 20px 50px -10px rgba(0, 0, 0, 0.12)',
                    }}
                  >
                    <AvatarImage 
                      src={expert.avatar_url} 
                      alt={`${expert.first_name} ${expert.last_name}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-2xl font-semibold">
                      {expert.first_name?.[0]}
                      {expert.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Verified badge with green */}
                  {expert.is_verified_expert && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#34C759] rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-[#34C759] transition-colors">
                  {expert.first_name} {expert.last_name}
                </h3>

                {/* Specialty / Title */}
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                  {expert.expert_title || expert.location_city || "Szakértő"}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile: View All button */}
        <div className="mt-6 text-center md:hidden">
          <Link to="/piacer">
            <Button className="gap-2 bg-[#34C759] hover:bg-[#2DB14E] text-white shadow-lg">
              {t('home.all_experts')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExpertGallery;
