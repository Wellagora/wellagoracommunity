import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

const PrivacyPolicyPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('privacy.back_home')}
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('privacy.title')}</h1>
              <p className="text-muted-foreground">{t('privacy.last_updated')}: 2025-01-26</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('privacy.intro_title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t('privacy.intro_text')}</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('privacy.controller_title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground whitespace-pre-line">{t('privacy.controller_text')}</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('privacy.data_collected_title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-3">{t('privacy.data_collected_intro')}</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('privacy.data_personal')}</li>
                <li>{t('privacy.data_account')}</li>
                <li>{t('privacy.data_activity')}</li>
                <li>{t('privacy.data_technical')}</li>
                <li>{t('privacy.data_communication')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('privacy.purpose_title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('privacy.purpose_service')}</li>
                <li>{t('privacy.purpose_communication')}</li>
                <li>{t('privacy.purpose_improvement')}</li>
                <li>{t('privacy.purpose_security')}</li>
                <li>{t('privacy.purpose_legal')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('privacy.legal_basis_title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('privacy.legal_consent')}</li>
                <li>{t('privacy.legal_contract')}</li>
                <li>{t('privacy.legal_legitimate')}</li>
                <li>{t('privacy.legal_obligation')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('privacy.sharing_title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-3">{t('privacy.sharing_intro')}</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('privacy.sharing_providers')}</li>
                <li>{t('privacy.sharing_legal')}</li>
                <li>{t('privacy.sharing_consent')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('privacy.retention_title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t('privacy.retention_text')}</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('privacy.rights_title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-3">{t('privacy.rights_intro')}</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t('privacy.right_access')}</li>
                <li>{t('privacy.right_rectification')}</li>
                <li>{t('privacy.right_erasure')}</li>
                <li>{t('privacy.right_restriction')}</li>
                <li>{t('privacy.right_portability')}</li>
                <li>{t('privacy.right_object')}</li>
                <li>{t('privacy.right_withdraw')}</li>
                <li>{t('privacy.right_complaint')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('privacy.security_title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t('privacy.security_text')}</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('privacy.cookies_title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t('privacy.cookies_text')}</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('privacy.changes_title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t('privacy.changes_text')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('privacy.contact_title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t('privacy.contact_text')}</p>
              <p className="text-muted-foreground mt-3">
                <strong>{t('privacy.contact_email')}</strong>: info@wellagora.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
