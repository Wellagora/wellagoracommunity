import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle,
  BookOpen,
  UserCog,
  Star,
  Users,
  Award,
  Mail
} from "lucide-react";

const HelpPage = () => {
  const { language } = useLanguage();

  const faqs = language === 'hu' ? [
    {
      q: "Hogyan hozok létre programot?",
      a: "Menj az Expert Studio-ba, kattints az \"Új Program\" gombra. A varázsló végigvezet a lépéseken: média feltöltés (opcionális), program részletek kitöltése, lokalizáció, majd előnézet és publikálás. A piszkozatot bármikor mentheted."
    },
    {
      q: "Hogyan szerkesztem a profilomat?",
      a: "Kattints a jobb felső sarokban lévő profilképedre, majd válaszd a \"Profil\" menüpontot. Itt módosíthatod a neved, szakterületed, bio-dat, profilképed és a többi adatot. Ne felejtsd el menteni a változtatásokat!"
    },
    {
      q: "Mi az a WellPoints?",
      a: "A WellPoints a platform belső pont rendszere, amivel jutalmazunk a közösségi aktivitásodért. Pontot kapsz regisztrációkor (+50), profil kitöltésért (+100), első program részvételért (+200) és más tevékenységekért. A pontok hamarosan felhasználhatók lesznek különböző jutalmakra."
    },
    {
      q: "Hogyan hívok meg tagokat?",
      a: "A zárt béta időszakban meghívó kóddal lehet csatlakozni a platformhoz. Kérj meghívó kódot az admin csapattól, és oszd meg az ismerőseiddel. A meghívottak a regisztráció során adhatják meg a kódot."
    },
    {
      q: "Ki a Founding Expert?",
      a: "A Founding Expert a platform első szakértői, akik a zárt béta időszakban csatlakoztak. Különleges arany badge-et kapnak, ami a profiljukon és programjaikon is megjelenik. A zárt béta alatt 0% platform díjjal hozhatnak létre programokat."
    },
    {
      q: "Hogyan lépek kapcsolatba a támogatással?",
      a: "Írj nekünk az info@wellagora.org email címre, vagy használd a platform beépített AI asszisztensét (WellBot) a gyors válaszokért. A csapatunk 24 órán belül válaszol."
    },
  ] : [
    {
      q: "How do I create a program?",
      a: "Go to Expert Studio, click 'New Program'. The wizard guides you through: media upload (optional), program details, localization, then preview and publish. You can save drafts at any time."
    },
    {
      q: "How do I edit my profile?",
      a: "Click your profile picture in the top right corner, then select 'Profile'. Here you can modify your name, expertise, bio, profile picture and other details. Don't forget to save your changes!"
    },
    {
      q: "What is WellPoints?",
      a: "WellPoints is the platform's internal points system that rewards your community activity. You earn points for registration (+50), profile completion (+100), first program participation (+200) and other activities."
    },
    {
      q: "How do I invite members?",
      a: "During the closed beta, members can join with an invite code. Request invite codes from the admin team and share them with your contacts. Invitees enter the code during registration."
    },
    {
      q: "What is a Founding Expert?",
      a: "Founding Experts are the platform's first experts who joined during the closed beta. They receive a special gold badge displayed on their profile and programs. During closed beta, they create programs with 0% platform fee."
    },
    {
      q: "How do I contact support?",
      a: "Email us at info@wellagora.org, or use the platform's built-in AI assistant (WellBot) for quick answers. Our team responds within 24 hours."
    },
  ];

  const sidebarLinks = [
    { label: language === 'hu' ? 'Expert Studio' : 'Expert Studio', href: '/expert-studio', icon: BookOpen },
    { label: language === 'hu' ? 'Profilom' : 'My Profile', href: '/profile', icon: UserCog },
    { label: language === 'hu' ? 'Piactér' : 'Marketplace', href: '/piacer', icon: Star },
    { label: language === 'hu' ? 'Közösség' : 'Community', href: '/community', icon: Users },
    { label: language === 'hu' ? 'Kapcsolat' : 'Contact', href: '/contact', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-4">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {language === 'hu' ? 'Segítség & GYIK' : 'Help & FAQ'}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {language === 'hu'
                ? 'Válaszok a leggyakoribb kérdésekre Founding Experteknek és tagoknak.'
                : 'Answers to the most common questions for Founding Experts and members.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {language === 'hu' ? 'Hasznos linkek' : 'Useful Links'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <nav className="space-y-1">
                    {sidebarLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </aside>

            {/* FAQ */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    {language === 'hu' ? 'Gyakran Ismételt Kérdések' : 'Frequently Asked Questions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-${i}`}>
                        <AccordionTrigger className="text-left font-medium">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Contact CTA */}
              <Card className="mt-6 bg-emerald-50 border-emerald-100">
                <CardContent className="p-6 text-center">
                  <p className="text-emerald-800 font-medium mb-2">
                    {language === 'hu'
                      ? 'Nem találtad meg a választ?'
                      : "Didn't find your answer?"}
                  </p>
                  <p className="text-emerald-600 text-sm mb-4">
                    {language === 'hu'
                      ? 'Írj nekünk és 24 órán belül válaszolunk!'
                      : "Write to us and we'll respond within 24 hours!"}
                  </p>
                  <a
                    href="mailto:info@wellagora.org"
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    info@wellagora.org
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpPage;