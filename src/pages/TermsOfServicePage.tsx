import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ShieldCheck, CreditCard, Users, AlertTriangle, Scale, Award, Building2, RotateCcw, Receipt, MessageSquareWarning } from "lucide-react";

const TermsOfServicePage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("terms.back_home")}
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t("terms.title")}</h1>
              <p className="text-muted-foreground">{t("terms.last_updated")}</p>
            </div>
          </div>

          {/* 1. Introduction */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>1. {t("terms.intro_title")}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground whitespace-pre-line">{t("terms.intro_text")}</p>
            </CardContent>
          </Card>

          {/* 2. Service Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                2. {t("terms.service_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-3">{t("terms.service_intro")}</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t("terms.service_marketplace")}</li>
                <li>{t("terms.service_events")}</li>
                <li>{t("terms.service_community")}</li>
                <li>{t("terms.service_wellpoints")}</li>
                <li>{t("terms.service_sponsorship")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* 3. User Roles */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                3. {t("terms.roles_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.role_member_title")}</h4>
                <p className="text-muted-foreground">{t("terms.role_member_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.role_expert_title")}</h4>
                <p className="text-muted-foreground">{t("terms.role_expert_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.role_sponsor_title")}</h4>
                <p className="text-muted-foreground">{t("terms.role_sponsor_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.role_founding_title")}</h4>
                <p className="text-muted-foreground">{t("terms.role_founding_text")}</p>
              </div>
            </CardContent>
          </Card>

          {/* 4. Payments & Pricing */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                4. {t("terms.payments_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.payments_pricing_title")}</h4>
                <p className="text-muted-foreground">{t("terms.payments_pricing_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.payments_commission_title")}</h4>
                <p className="text-muted-foreground">{t("terms.payments_commission_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.payments_invoice_title")}</h4>
                <p className="text-muted-foreground">{t("terms.payments_invoice_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.payments_refund_title")}</h4>
                <p className="text-muted-foreground">{t("terms.payments_refund_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.payments_wellpoints_title")}</h4>
                <p className="text-muted-foreground">{t("terms.payments_wellpoints_text")}</p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Expert Obligations */}
          <Card className="mb-6 border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                5. {t("terms.expert_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.expert_aszf_title")}</h4>
                <p className="text-muted-foreground">{t("terms.expert_aszf_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.expert_legal_title")}</h4>
                <p className="text-muted-foreground">{t("terms.expert_legal_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.expert_content_title")}</h4>
                <p className="text-muted-foreground">{t("terms.expert_content_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.expert_dac7_title")}</h4>
                <p className="text-muted-foreground">{t("terms.expert_dac7_text")}</p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Sponsor Credits */}
          <Card className="mb-6 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                6. {t("terms.sponsor_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.sponsor_purchase_title")}</h4>
                <p className="text-muted-foreground">{t("terms.sponsor_purchase_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.sponsor_usage_title")}</h4>
                <p className="text-muted-foreground">{t("terms.sponsor_usage_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.sponsor_expiry_title")}</h4>
                <p className="text-muted-foreground">{t("terms.sponsor_expiry_text")}</p>
              </div>
            </CardContent>
          </Card>

          {/* 7. Withdrawal Rights */}
          <Card className="mb-6 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-green-600" />
                7. {t("terms.withdrawal_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground whitespace-pre-line">{t("terms.withdrawal_text")}</p>
            </CardContent>
          </Card>

          {/* 8. Content & Intellectual Property */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-500" />
                8. {t("terms.content_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.content_ownership_title")}</h4>
                <p className="text-muted-foreground">{t("terms.content_ownership_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.content_license_title")}</h4>
                <p className="text-muted-foreground">{t("terms.content_license_text")}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t("terms.content_prohibited_title")}</h4>
                <p className="text-muted-foreground">{t("terms.content_prohibited_text")}</p>
              </div>
            </CardContent>
          </Card>

          {/* 9. Liability */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                9. {t("terms.liability_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-3">{t("terms.liability_text")}</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t("terms.liability_platform")}</li>
                <li>{t("terms.liability_expert")}</li>
                <li>{t("terms.liability_availability")}</li>
                <li>{t("terms.liability_force_majeure")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* 10. Complaints & Dispute Resolution */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-orange-500" />
                10. {t("terms.complaints_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground whitespace-pre-line">{t("terms.complaints_text")}</p>
            </CardContent>
          </Card>

          {/* 11. Termination */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>11. {t("terms.termination_title")}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t("terms.termination_text")}</p>
            </CardContent>
          </Card>

          {/* 12. Governing Law */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                12. {t("terms.law_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t("terms.law_text")}</p>
            </CardContent>
          </Card>

          {/* 13. Changes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>13. {t("terms.changes_title")}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t("terms.changes_text")}</p>
            </CardContent>
          </Card>

          {/* 14. Contact */}
          <Card>
            <CardHeader>
              <CardTitle>14. {t("terms.contact_title")}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t("terms.contact_text")}</p>
              <div className="mt-4 bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground">ProSelf International Zrt</p>
                <p className="text-muted-foreground">1133 Budapest, Pannónia u. 102, Magyarország</p>
                <p className="text-muted-foreground">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:info@wellagora.org" className="text-primary hover:underline">info@wellagora.org</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
