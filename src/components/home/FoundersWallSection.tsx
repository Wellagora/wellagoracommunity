import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { FoundingExpertBadge } from "@/components/expert/FoundingExpertBadge";

interface Founder {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  expert_title: string | null;
  expert_slug: string | null;
}

const FoundersWallSection = () => {
  const { t } = useLanguage();
  const [founders, setFounders] = useState<Founder[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, expert_title, expert_slug")
        .eq("is_founding_expert", true)
        .order("founding_expert_since", { ascending: true });
      if (data) setFounders(data as Founder[]);
    };
    fetch();
  }, []);

  if (founders.length === 0) return null;

  return (
    <section className="py-14 bg-[#FEFCF7] border-t-2 border-[#D4A843]/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("founding_expert.founders_title")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t("founding_expert.founders_subtitle")}
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-8">
          {founders.map((founder, i) => (
            <motion.div
              key={founder.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center w-40"
            >
              <Link to={`/expert/${founder.expert_slug || founder.id}`}>
                <img
                  src={
                    founder.avatar_url ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
                  }
                  alt={`${founder.first_name || ""} ${founder.last_name || ""}`}
                  className="w-24 h-24 rounded-full object-cover border-3 border-[#D4A843] shadow-md mb-3 hover:scale-105 transition-transform"
                />
              </Link>
              <h3 className="font-semibold text-foreground text-sm">
                {founder.first_name} {founder.last_name}
              </h3>
              {founder.expert_title && (
                <p className="text-xs text-muted-foreground mt-0.5 mb-1">
                  {founder.expert_title}
                </p>
              )}
              <FoundingExpertBadge size="sm" showTooltip={false} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FoundersWallSection;
