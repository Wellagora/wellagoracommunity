import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";
import { MapPin, Mail } from "lucide-react";
import { resetCookieConsent } from "@/components/CookieConsentBanner";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/90 backdrop-blur-xl border-t border-[#E5E5E7] mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* About Section */}
          <div>
            <h3 className="font-bold text-foreground mb-3">{t('footer.about_title')}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('footer.about_text')}
            </p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">ProSelf International Zrt.</p>
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>1133 Budapest, Pannónia u 102.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <a href="mailto:info@wellagora.org" className="hover:text-primary transition-colors">
                  info@wellagora.org
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-foreground mb-3">{t('footer.quick_links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/programs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.link_programs')}
                </Link>
              </li>
              <li>
                <Link to="/esemenyek" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.events')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.link_contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-foreground mb-3">{t('footer.support_title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/ai-assistant" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.link_ai_assistant')}
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.link_help')}
                </Link>
              </li>
              <li>
                <a href="mailto:info@wellagora.org" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.link_email')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-foreground mb-3">{t('footer.legal_title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.link_terms') || 'ÁSZF'}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.link_privacy')}
                </Link>
              </li>
              <li>
                <Link to="/impressum" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.link_impressum')}
                </Link>
              </li>
              <li>
                <button
                  onClick={resetCookieConsent}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.cookie_settings') || 'Cookie beállítások'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>
            © {currentYear} {t('footer.copyright')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/terms" className="hover:text-primary transition-colors">
              {t('footer.terms_short') || 'ÁSZF'}
            </Link>
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">
              {t('footer.privacy_short')}
            </Link>
            <button onClick={resetCookieConsent} className="hover:text-primary transition-colors">
              {t('footer.cookie_settings') || 'Cookie beállítások'}
            </button>
            <span>© {currentYear} ProSelf International Zrt.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
