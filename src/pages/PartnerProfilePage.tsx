import { useState } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { 
  Store, MapPin, ExternalLink, Gift, Percent, Tag, 
  ChevronLeft, Clock, Users, Star, Heart
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PartnerOfferCard from "@/components/partners/PartnerOfferCard";

// Partner data (would come from database in production)
const PARTNERS_DATA: Record<string, {
  name: string;
  logo: string;
  description: { hu: string; en: string; de: string };
  category: string;
  website: string;
  locations: string[];
  offers: Array<{
    id: string;
    partnerName: string;
    partnerSlug: string;
    offerTitle: string;
    offerDescription?: string;
    discountType: "percentage" | "fixed" | "gift";
    discountValue: string;
    productUrl?: string;
    isOnline: boolean;
    redemptionLocation?: string;
  }>;
}> = {
  praktiker: {
    name: "Praktiker",
    logo: "/partner-logos/praktiker.png",
    description: {
      hu: "Magyarország egyik vezető barkács- és kertészeti áruházlánca. Tagjainknak exkluzív kedvezményeket kínálunk kertészeti és fenntarthatósági termékekre.",
      en: "One of Hungary's leading DIY and garden retail chains. We offer exclusive discounts on gardening and sustainability products for our members.",
      de: "Eine der führenden Baumarkt- und Gartencenter-Ketten in Ungarn. Wir bieten unseren Mitgliedern exklusive Rabatte auf Garten- und Nachhaltigkeitsprodukte."
    },
    category: "DIY & Garden",
    website: "https://www.praktiker.hu",
    locations: ["Budapest", "Debrecen", "Szeged", "Pécs", "Győr"],
    offers: [
      {
        id: "p1",
        partnerName: "Praktiker",
        partnerSlug: "praktiker",
        offerTitle: "10% kedvezmény kertészeti eszközökre",
        offerDescription: "A WellAgora közösségnek járó kedvezményt itt éred el.",
        discountType: "percentage",
        discountValue: "10%",
        isOnline: false,
        redemptionLocation: "Minden Praktiker üzletben"
      },
      {
        id: "p2",
        partnerName: "Praktiker",
        partnerSlug: "praktiker",
        offerTitle: "Ingyenes palántacsomag",
        offerDescription: "5000 Ft feletti vásárlás esetén ajándék bio palánta csomag.",
        discountType: "gift",
        discountValue: "Ajándék",
        isOnline: false,
        redemptionLocation: "Kertészeti részleg"
      }
    ]
  },
  dm: {
    name: "DM",
    logo: "/partner-logos/dm.png",
    description: {
      hu: "A dm-drogerie markt a fenntartható szépségápolás és egészség szakértője. Bio és természetes kozmetikumainkra különleges árakat kínálunk WellAgora tagoknak.",
      en: "dm-drogerie markt is the expert in sustainable beauty and health care. We offer special prices on organic and natural cosmetics for WellAgora members.",
      de: "dm-drogerie markt ist der Experte für nachhaltige Schönheits- und Gesundheitspflege. Für WellAgora-Mitglieder bieten wir Sonderpreise für Bio- und Naturkosmetik."
    },
    category: "Health & Beauty",
    website: "https://www.dm.hu",
    locations: ["Budapest", "Országos hálózat"],
    offers: [
      {
        id: "dm1",
        partnerName: "DM",
        partnerSlug: "dm",
        offerTitle: "15% kedvezmény alverde termékekre",
        offerDescription: "A WellAgora közösségnek járó kedvezményt itt éred el.",
        discountType: "percentage",
        discountValue: "15%",
        isOnline: false,
        redemptionLocation: "Minden dm üzletben"
      }
    ]
  },
  rossmann: {
    name: "Rossmann",
    logo: "/partner-logos/rossmann.png",
    description: {
      hu: "A Rossmann széles választékot kínál egészség- és szépségápolási termékekből. Fenntartható termékvonalunkra különleges kedvezményeket biztosítunk.",
      en: "Rossmann offers a wide range of health and beauty products. We provide special discounts on our sustainable product line.",
      de: "Rossmann bietet eine große Auswahl an Gesundheits- und Schönheitsprodukten. Wir gewähren Sonderrabatte auf unsere nachhaltige Produktlinie."
    },
    category: "Health & Beauty",
    website: "https://www.rossmann.hu",
    locations: ["Budapest", "Országos hálózat"],
    offers: [
      {
        id: "r1",
        partnerName: "Rossmann",
        partnerSlug: "rossmann",
        offerTitle: "10% kedvezmény fenntartható termékekre",
        offerDescription: "A WellAgora közösségnek járó kedvezményt itt éred el.",
        discountType: "percentage",
        discountValue: "10%",
        isOnline: false,
        redemptionLocation: "Minden Rossmann üzletben"
      }
    ]
  }
};

const PartnerProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [isFavorite, setIsFavorite] = useState(false);

  const partner = slug ? PARTNERS_DATA[slug] : null;

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Eltávolítva a kedvencekből" : "Hozzáadva a kedvencekhez ❤️",
      description: isFavorite 
        ? "A partner el lett távolítva a kedvenceid közül." 
        : "A partnert megtalálod a kedvenceid között.",
    });
  };

  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-20">
          <div className="text-center">
            <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              {language === "hu" ? "Partner nem található" : "Partner not found"}
            </h1>
            <Link to="/partners">
              <Button variant="outline" className="mt-4">
                <ChevronLeft className="w-4 h-4 mr-2" />
                {language === "hu" ? "Vissza a partnerekhez" : "Back to partners"}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const description = partner.description[language as keyof typeof partner.description] || partner.description.en;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Hero Section - Marketplace-consistent Glassmorphism Style */}
        <section className="bg-white/80 backdrop-blur-xl py-12 border-b border-border/10">
          <div className="container mx-auto px-4 lg:px-10">
            <Link to="/partners" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" />
              {language === "hu" ? "Minden partner" : "All partners"}
            </Link>

            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Partner Logo - Large, high-res, clean */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-40 h-40 rounded-2xl bg-white/80 backdrop-blur-md border border-border/20 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex-shrink-0 flex items-center justify-center"
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://logo.clearbit.com/${partner.website.replace('https://', '').replace('www.', '')}?size=256`;
                  }}
                />
              </motion.div>

              {/* Partner Info */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl font-bold text-foreground">{partner.name}</h1>
                    <Badge variant="secondary" className="text-sm bg-black/5 text-foreground border-0">{partner.category}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-5 max-w-2xl leading-relaxed">{description}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button size="default" asChild className="bg-black hover:bg-black/90 text-white font-semibold shadow-lg">
                      <a href={partner.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {language === "hu" ? "Irány a webshop" : language === "de" ? "Zum Webshop" : "Visit Webshop"}
                      </a>
                    </Button>
                    <Button variant="outline" size="default" asChild className="border-black/10 hover:bg-black/5">
                      <a href={partner.website} target="_blank" rel="noopener noreferrer">
                        <Store className="w-4 h-4 mr-2" />
                        {language === "hu" ? "Weboldal" : "Website"}
                      </a>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="default"
                      onClick={handleFavoriteClick}
                      className={isFavorite ? "text-red-500 hover:text-red-600" : "hover:bg-black/5"}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                      {language === "hu" ? "Kedvenc" : "Favorite"}
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Offers Section - Marketplace-consistent card styling */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 lg:px-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Gift className="w-6 h-6 text-primary" />
              {language === "hu" ? "Elérhető kedvezmények" : "Available Offers"}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partner.offers.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-md border-[0.5px] border-black/5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-[1.02]">
                    <CardContent className="p-6">
                      <PartnerOfferCard offer={offer} />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Locations Section - Consistent styling */}
        <section className="py-12 bg-slate-50/30">
          <div className="container mx-auto px-4 lg:px-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              {language === "hu" ? "Üzletek" : "Locations"}
            </h2>

            <div className="flex flex-wrap gap-3">
              {partner.locations.map((location) => (
                <Badge 
                  key={location} 
                  variant="outline" 
                  className="text-sm py-2 px-4 bg-white/80 backdrop-blur-sm border-black/10 shadow-sm"
                >
                  <MapPin className="w-3 h-3 mr-1.5" />
                  {location}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PartnerProfilePage;
