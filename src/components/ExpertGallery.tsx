import { useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface Expert {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  expert_title: string | null;
  location_city: string | null;
  is_verified_expert: boolean | null;
}

const ExpertGallery = () => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: experts, isLoading } = useQuery({
    queryKey: ["experts-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, expert_title, location_city, is_verified_expert")
        .in("user_role", ["expert", "creator"])
        .eq("is_public_profile", true)
        .limit(12);

      if (error) throw error;
      return data as Expert[];
    },
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-16 bg-[#F5F5F7]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 w-48 bg-white/50 rounded-lg animate-pulse" />
              <div className="h-4 w-64 bg-white/30 rounded-lg animate-pulse mt-2" />
            </div>
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-48 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-white/50 animate-pulse" />
                <div className="h-4 w-24 bg-white/50 rounded animate-pulse mt-4" />
                <div className="h-3 w-32 bg-white/30 rounded animate-pulse mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Dummy data for MVP visualization
  const DUMMY_EXPERTS: Expert[] = [
    {
      id: "dummy-1",
      first_name: "Kovács",
      last_name: "János",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      expert_title: "Sajtmester",
      location_city: "Káli-medence",
      is_verified_expert: true,
    },
    {
      id: "dummy-2",
      first_name: "Bécsi",
      last_name: "Anna",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
      expert_title: "Restaurátor",
      location_city: "Budapest",
      is_verified_expert: true,
    },
    {
      id: "dummy-3",
      first_name: "Nagy",
      last_name: "Péter",
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
      expert_title: "Asztalosmester",
      location_city: "Tihany",
      is_verified_expert: true,
    },
    {
      id: "dummy-4",
      first_name: "Szabó",
      last_name: "Eszter",
      avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      expert_title: "Permakultúra szakértő",
      location_city: "Balaton-felvidék",
      is_verified_expert: false,
    },
    {
      id: "dummy-5",
      first_name: "Tóth",
      last_name: "Gábor",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
      expert_title: "Pálinkafőző mester",
      location_city: "Tokaj",
      is_verified_expert: true,
    },
  ];

  // Use real experts if available, otherwise show dummy data
  const displayExperts = experts && experts.length > 0 ? experts : DUMMY_EXPERTS;

  return (
    <section className="py-16 bg-[#F5F5F7]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Szakértőink
            </h2>
            <p className="text-slate-600 mt-1">
              Ismerd meg a közösségünk mestereit
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("left")}
              className="rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("right")}
              className="rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Link to="/piacer" className="ml-4">
              <Button variant="ghost" className="gap-2 text-[#007AFF] hover:text-[#0056b3] hover:bg-blue-50">
                Mind megtekintése
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
          {displayExperts.map((expert, index) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              style={{ scrollSnapAlign: "start" }}
            >
              <Link
                to={`/piacer?creator=${expert.id}`}
                className="flex flex-col items-center text-center group w-48 flex-shrink-0"
              >
                {/* Circular Portrait */}
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow">
                    <AvatarImage 
                      src={expert.avatar_url || undefined} 
                      alt={`${expert.first_name} ${expert.last_name}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-[#007AFF] to-[#00C7BE] text-white text-2xl font-semibold">
                      {expert.first_name?.[0]}
                      {expert.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Verified badge */}
                  {expert.is_verified_expert && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#007AFF] rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-[#007AFF] transition-colors">
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
            <Button className="gap-2 bg-[#007AFF] hover:bg-[#0056b3] text-white">
              Összes szakértő
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExpertGallery;
