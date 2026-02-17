import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const ImpressumPage = () => {
  const { t } = useLanguage();


  return (
    <>
      <SEOHead
        title={t('seo.impressum.title')}
        description={t('seo.impressum.description')}
      />
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('impressum.back_home')}
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('impressum.title')}</h1>
              <p className="text-muted-foreground">{t('impressum.subtitle')}</p>
            </div>
          </div>

          {/* Always render from translation keys */}
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('impressum.company_info_title')}</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground whitespace-pre-line">{t('impressum.company_info')}</p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('impressum.contact_title')}</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground whitespace-pre-line">{t('impressum.contact_info')}</p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('impressum.represented_title')}</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground">{t('impressum.represented_info')}</p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('impressum.registration_title')}</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground whitespace-pre-line">{t('impressum.registration_info')}</p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('impressum.vat_title')}</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground">{t('impressum.vat_info')}</p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('impressum.responsible_title')}</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground">{t('impressum.responsible_info')}</p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('impressum.disclaimer_title')}</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('impressum.disclaimer_liability_title')}</h3>
                    <p className="text-muted-foreground">{t('impressum.disclaimer_liability_text')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('impressum.disclaimer_links_title')}</h3>
                    <p className="text-muted-foreground">{t('impressum.disclaimer_links_text')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('impressum.disclaimer_copyright_title')}</h3>
                    <p className="text-muted-foreground">{t('impressum.disclaimer_copyright_text')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('impressum.dispute_title')}</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground">{t('impressum.dispute_text')}</p>
                <p className="text-muted-foreground mt-2">
                  <strong>{t('impressum.dispute_link')}</strong>: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr</a>
                </p>
              </CardContent>
            </Card>
          </>
        </div>
      </div>

      <Footer />
    </div>
    </>
  );
};

export default ImpressumPage;