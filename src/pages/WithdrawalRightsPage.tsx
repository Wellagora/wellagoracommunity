import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Info, Ban, ClipboardList, CreditCard, FileDown } from "lucide-react";

const WithdrawalRightsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("withdrawal.back_home")}
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t("withdrawal.title")}</h1>
              <p className="text-muted-foreground">{t("withdrawal.last_updated")}</p>
            </div>
          </div>

          {/* Introduction */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                {t("withdrawal.intro_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t("withdrawal.intro_text")}</p>
            </CardContent>
          </Card>

          {/* Scope */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                {t("withdrawal.scope_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground whitespace-pre-line">{t("withdrawal.scope_text")}</p>
            </CardContent>
          </Card>

          {/* Exceptions */}
          <Card className="mb-6 border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-amber-500" />
                {t("withdrawal.exception_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground whitespace-pre-line">{t("withdrawal.exception_text")}</p>
            </CardContent>
          </Card>

          {/* How to withdraw */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("withdrawal.howto_title")}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground whitespace-pre-line">{t("withdrawal.howto_text")}</p>
            </CardContent>
          </Card>

          {/* Refund */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                {t("withdrawal.refund_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">{t("withdrawal.refund_text")}</p>
            </CardContent>
          </Card>

          {/* Template */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-primary" />
                {t("withdrawal.template_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-4">{t("withdrawal.template_text")}</p>
              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <p className="text-foreground whitespace-pre-line font-mono text-xs leading-relaxed">
                  {t("withdrawal.template_body")}
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

export default WithdrawalRightsPage;
