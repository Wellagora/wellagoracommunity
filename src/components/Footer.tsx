import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Mail, Leaf } from "lucide-react";
import { resetCookieConsent } from "@/components/CookieConsentBanner";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const linkClasses = "text-sm text-white/60 hover:text-emerald-400 transition-colors duration-200";

  return (
    <footer className="text-white/70 mt-auto" style={{ background: 'linear-gradient(180deg, #022c22 0%, #021a13 100%)' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white">{t('footer.about_title')}</h3>
            </div>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">
              {t('footer.about_text')}
            </p>
            <div className="space-y-2 text-sm text-white/50">
              <p className="font-medium text-white/80">ProSelf International Zrt</p>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400/60" />
                <span>1133 Budapest, Pannónia u. 102</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0 text-emerald-400/60" />
                <a href="mailto:info@wellagora.org" className="hover:text-emerald-400 transition-colors">
                  info@wellagora.org
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.quick_links')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/programs" className={linkClasses}>
                  {t('footer.link_programs')}
                </Link>
              </li>
              <li>
                <Link to="/esemenyek" className={linkClasses}>
                  {t('nav.events')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className={linkClasses}>
                  {t('nav.blog')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className={linkClasses}>
                  {t('footer.link_contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('nav.community')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/founding-expert" className="text-sm text-white/60 hover:text-amber-400 transition-colors duration-200">
                  Founding Expert
                </Link>
              </li>
              <li>
                <Link to="/sponsors" className={linkClasses}>
                  {t('nav.sponsors') || 'Sponsors'}
                </Link>
              </li>
              <li>
                <Link to="/gyik" className={linkClasses}>
                  {t('nav.faq')}
                </Link>
              </li>
              <li>
                <a href="mailto:info@wellagora.org" className={linkClasses}>
                  {t('footer.link_email')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.legal_title')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className={linkClasses}>
                  {t('footer.link_terms') || 'ÁSZF'}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className={linkClasses}>
                  {t('footer.link_privacy')}
                </Link>
              </li>
              <li>
                <Link to="/impressum" className={linkClasses}>
                  {t('footer.link_impressum')}
                </Link>
              </li>
              <li>
                <button
                  onClick={resetCookieConsent}
                  className={linkClasses}
                >
                  {t('footer.cookie_settings') || 'Cookie beállítások'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-medium">WellAgora</span>
              <span className="hidden sm:inline">— Fenntarthatósági közösségi platform</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link to="/terms" className="hover:text-emerald-400 transition-colors">
                {t('footer.terms_short') || 'ÁSZF'}
              </Link>
              <Link to="/privacy-policy" className="hover:text-emerald-400 transition-colors">
                {t('footer.privacy_short')}
              </Link>
              <button onClick={resetCookieConsent} className="hover:text-emerald-400 transition-colors">
                {t('footer.cookie_settings') || 'Cookie beállítások'}
              </button>
              <span>© {currentYear} ProSelf International Zrt</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
