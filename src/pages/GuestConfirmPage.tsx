import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ExternalLink, UserPlus } from "lucide-react";
import { confirmGuestRegistration } from "@/services/guestRegistration";

const GuestConfirmPage = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [programId, setProgramId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    confirmGuestRegistration(token).then((result) => {
      if (result.success) {
        setStatus("success");
        setProgramId(result.programId || null);
        setGuestName(result.guestName || null);
      } else {
        setStatus("error");
      }
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-muted-foreground">
                {t("guest_registration.confirm_loading")}
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">
                {t("guest_registration.confirm_title")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("guest_registration.confirm_description")}
              </p>
              <div className="space-y-3">
                {programId && (
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/program/${programId}`)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t("guest_registration.view_program")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (guestName) params.set("name", guestName);
                    params.set("from", "guest");
                    navigate(`/auth?${params.toString()}`);
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t("guest_registration.create_account")}
                </Button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-red-700">
                {t("guest_registration.confirm_error")}
              </h2>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/")}
              >
                {t("common.back_to_home") || "Vissza a főoldalra"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestConfirmPage;
