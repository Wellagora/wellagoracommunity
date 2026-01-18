import { memo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface Partner {
  id: string;
  name: string;
  slug: string;
  logo: string;
  category: string;
}

// Featured partners
const FEATURED_PARTNERS: Partner[] = [
  {
    id: "1",
    name: "Praktiker",
    slug: "praktiker",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Praktiker_logo.svg/200px-Praktiker_logo.svg.png",
    category: "DIY & Garden"
  },
  {
    id: "2",
    name: "DM",
    slug: "dm",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Dm_Logo.svg/200px-Dm_Logo.svg.png",
    category: "Health & Beauty"
  },
  {
    id: "3",
    name: "Rossmann",
    slug: "rossmann",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Rossmann_Logo.svg/200px-Rossmann_Logo.svg.png",
    category: "Health & Beauty"
  },
  {
    id: "4",
    name: "OBI",
    slug: "obi",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Obi-Logo.svg/200px-Obi-Logo.svg.png",
    category: "DIY & Garden"
  },
  {
    id: "5",
    name: "IKEA",
    slug: "ikea",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ikea_logo.svg/200px-Ikea_logo.svg.png",
    category: "Home & Living"
  },
  {
    id: "6",
    name: "Auchan",
    slug: "auchan",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Auchan_logo.svg/200px-Auchan_logo.svg.png",
    category: "Grocery"
  },
  {
    id: "7",
    name: "SPAR",
    slug: "spar",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/SPAR_Logo.svg/200px-SPAR_Logo.svg.png",
    category: "Grocery"
  },
  {
    id: "8",
    name: "Müller",
    slug: "muller",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Muller_logo.svg/200px-Muller_logo.svg.png",
    category: "Health & Beauty"
  },
];

interface PartnerLogosGridProps {
  variant?: "compact" | "full";
  maxItems?: number;
  showTitle?: boolean;
  className?: string;
}

export const PartnerLogosGrid = memo(({ 
  variant = "full",
  maxItems = 8,
  showTitle = true,
  className = ""
}: PartnerLogosGridProps) => {
  const { language } = useLanguage();
  const partners = FEATURED_PARTNERS.slice(0, maxItems);

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
        {partners.map((partner, index) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link 
              to={`/partners/${partner.slug}`}
              className="block w-12 h-12 rounded-lg bg-white border border-border/20 p-2 hover:shadow-md hover:scale-110 transition-all"
            >
              <img 
                src={partner.logo} 
                alt={partner.name} 
                className="w-full h-full object-contain opacity-70 hover:opacity-100 transition-opacity"
              />
            </Link>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {language === "hu" ? "Partnereink" : "Our Partners"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === "hu" 
              ? "Exkluzív kedvezmények tagjainknak" 
              : "Exclusive discounts for our members"}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {partners.map((partner, index) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link 
              to={`/partners/${partner.slug}`}
              className="group block aspect-square rounded-xl bg-white border border-border/20 p-3 hover:shadow-lg hover:border-primary/20 transition-all"
            >
              <div className="w-full h-full flex items-center justify-center">
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className="max-w-full max-h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </Link>
            <p className="text-xs text-center text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {partner.name}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

PartnerLogosGrid.displayName = "PartnerLogosGrid";

export default PartnerLogosGrid;
