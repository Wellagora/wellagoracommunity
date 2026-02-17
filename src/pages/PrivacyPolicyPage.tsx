import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Bot, Users, Cookie, Scale, Lock, Database } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const PrivacyPolicyPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead
        title={t('seo.privacy.title')}
        description={t('seo.privacy.description')}
      />
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("privacy.back_home")}
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t("privacy.title")}</h1>
              <p className="text-muted-foreground">{t("privacy.last_updated")}: 2026-02-10</p>
            </div>
          </div>

          {/* Introduction */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("privacy.intro_title")}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t("privacy.intro_text")}</p>
            </CardContent>
          </Card>

          {/* Data Controller */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("privacy.controller_title")}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground whitespace-pre-line">{t("privacy.controller_text")}</p>
            </CardContent>
          </Card>

          {/* Data Collected */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                {t("privacy.data_collected_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-3">{t("privacy.data_collected_intro")}</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t("privacy.data_personal")}</li>
                <li>{t("privacy.data_account")}</li>
                <li>{t("privacy.data_activity")}</li>
                <li>{t("privacy.data_technical")}</li>
                <li>{t("privacy.data_communication")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* AI Assistant Data Handling */}
          <Card className="mb-6 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                {t("privacy.ai_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.ai_data_collected_title")}</h4>
                <p className="text-muted-foreground mb-2">{t("privacy.ai_data_collected_intro")}</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>{t("privacy.ai_data_messages")}</li>
                  <li>{t("privacy.ai_data_context")}</li>
                  <li>{t("privacy.ai_data_metadata")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.ai_purpose_title")}</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>{t("privacy.ai_purpose_response")}</li>
                  <li>{t("privacy.ai_purpose_personalization")}</li>
                  <li>{t("privacy.ai_purpose_improvement")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.ai_third_party_title")}</h4>
                <p className="text-muted-foreground">{t("privacy.ai_third_party_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.ai_retention_title")}</h4>
                <p className="text-muted-foreground">{t("privacy.ai_retention_text")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Creator Content Handling */}
          <Card className="mb-6 border-secondary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                {t("privacy.creator_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.creator_types_title")}</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>{t("privacy.creator_type_posts")}</li>
                  <li>{t("privacy.creator_type_comments")}</li>
                  <li>{t("privacy.creator_type_stories")}</li>
                  <li>{t("privacy.creator_type_images")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.creator_ownership_title")}</h4>
                <p className="text-muted-foreground">{t("privacy.creator_ownership_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.creator_moderation_title")}</h4>
                <p className="text-muted-foreground">{t("privacy.creator_moderation_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.creator_visibility_title")}</h4>
                <p className="text-muted-foreground">{t("privacy.creator_visibility_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.creator_retention_title")}</h4>
                <p className="text-muted-foreground">{t("privacy.creator_retention_text")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5 text-accent" />
                {t("privacy.cookies_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <p className="text-muted-foreground">{t("privacy.cookies_intro")}</p>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.cookies_essential_title")}</h4>
                <p className="text-muted-foreground">{t("privacy.cookies_essential_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.cookies_functional_title")}</h4>
                <p className="text-muted-foreground">{t("privacy.cookies_functional_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("privacy.cookies_analytics_title")}</h4>
                <p className="text-muted-foreground">{t("privacy.cookies_analytics_text")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Purpose of Processing */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("privacy.purpose_title")}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t("privacy.purpose_service")}</li>
                <li>{t("privacy.purpose_communication")}</li>
                <li>{t("privacy.purpose_improvement")}</li>
                <li>{t("privacy.purpose_security")}</li>
                <li>{t("privacy.purpose_legal")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Legal Basis */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("privacy.legal_basis_title")}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t("privacy.legal_consent")}</li>
                <li>{t("privacy.legal_contract")}</li>
                <li>{t("privacy.legal_legitimate")}</li>
                <li>{t("privacy.legal_obligation")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("privacy.sharing_title")}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-3">{t("privacy.sharing_intro")}</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t("privacy.sharing_providers")}</li>
                <li>{t("privacy.sharing_ai_provider")}</li>
                <li>{t("privacy.sharing_legal")}</li>
                <li>{t("privacy.sharing_consent")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Retention */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("privacy.retention_title")}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t("privacy.retention_text")}</p>
            </CardContent>
          </Card>

          {/* GDPR Rights */}
          <Card className="mb-6 border-success/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-success" />
                {t("privacy.rights_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-3">{t("privacy.rights_intro")}</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>{t("privacy.right_access_label")}:</strong> {t("privacy.right_access")}</li>
                <li><strong>{t("privacy.right_rectification_label")}:</strong> {t("privacy.right_rectification")}</li>
                <li><strong>{t("privacy.right_erasure_label")}:</strong> {t("privacy.right_erasure")}</li>
                <li><strong>{t("privacy.right_restriction_label")}:</strong> {t("privacy.right_restriction")}</li>
                <li><strong>{t("privacy.right_portability_label")}:</strong> {t("privacy.right_portability")}</li>
                <li><strong>{t("privacy.right_object_label")}:</strong> {t("privacy.right_object")}</li>
                <li><strong>{t("privacy.right_withdraw_label")}:</strong> {t("privacy.right_withdraw")}</li>
              </ul>
              <p className="text-muted-foreground mt-4">{t("privacy.rights_exercise")}</p>
            </CardContent>
          </Card>

          {/* Supervisory Authority */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("privacy.authority_title")}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-3">{t("privacy.authority_intro")}</p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground">Österreichische Datenschutzbehörde</p>
                <p className="text-muted-foreground">Barichgasse 40-42</p>
                <p className="text-muted-foreground">1030 Vienna, Austria</p>
                <p className="text-muted-foreground mt-2">
                  <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    www.dsb.gv.at
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-warning" />
                {t("privacy.security_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t("privacy.security_text")}</p>
            </CardContent>
          </Card>

          {/* Changes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("privacy.changes_title")}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t("privacy.changes_text")}</p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>{t("privacy.contact_title")}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t("privacy.contact_text")}</p>
              <div className="mt-4 bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground">ProSelf International Inc.</p>
                <p className="text-muted-foreground">1133 Budapest, Pannónia u 102.</p>
                <p className="text-muted-foreground">
                  <strong>{t("privacy.contact_email")}:</strong>{" "}
                  <a href="mailto:info@wellagora.org" className="text-primary hover:underline">info@wellagora.org</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
    </>
  );
};

export default PrivacyPolicyPage;
