import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, LogIn, Loader2, Mail } from "lucide-react";
import { registerAsGuest } from "@/services/guestRegistration";

interface GuestRegistrationFormProps {
  programId: string;
}

export default function GuestRegistrationForm({ programId }: GuestRegistrationFormProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const result = await registerAsGuest(programId, name, email);

    if (result.success) {
      setSuccess(true);
    } else if (!result.success) {
      switch (result.error) {
        case "already_registered":
          setError(t("guest_registration.already_registered"));
          break;
        case "account_exists":
          setError(t("guest_registration.account_exists"));
          break;
        default:
          setError(t("guest_registration.error"));
      }
    }

    setIsSubmitting(false);
  };

  if (success) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
            <Mail className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-emerald-700 font-medium mb-1">
            {t("guest_registration.success")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          {t("guest_registration.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="guest-name" className="text-sm">
              {t("guest_registration.name_label")}
            </Label>
            <Input
              id="guest-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("guest_registration.name_placeholder")}
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="guest-email" className="text-sm">
              {t("guest_registration.email_label")}
            </Label>
            <Input
              id="guest-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("guest_registration.email_placeholder")}
              required
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            disabled={isSubmitting || !name.trim() || !email.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("guest_registration.submitting")}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t("guest_registration.submit")}
              </>
            )}
          </Button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("guest_registration.or_login")}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate(`/auth?redirect=/program/${programId}`)}
          >
            <LogIn className="w-4 h-4 mr-2" />
            {t("auth.login")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
