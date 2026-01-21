import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Building2, MapPin, Heart, Mail, Lock, UserCheck, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import TermsModal from "@/components/legal/TermsModal";

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be less than 128 characters"),
  confirmPassword: z.string(),
  role: z.enum(["citizen", "business", "government", "ngo"], {
    message: "Please select a role",
  }),
  organization: z.string().trim().max(100, "Organization name must be less than 100 characters").optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

type TranslateFunction = (key: string) => string | undefined;

const getUserRoles = (t: TranslateFunction) => [
  { 
    id: "citizen", 
    name: t('journey.role_citizen') || "Einzelperson", 
    icon: User, 
    description: t('profile.role_citizen_desc') || "Persönliche Nachhaltigkeitsreise",
    color: "bg-success"
  },
  { 
    id: "business", 
    name: t('journey.role_business') || "Unternehmen", 
    icon: Building2, 
    description: t('profile.role_business_desc') || "Unternehmensziele",
    color: "bg-accent"
  },
  { 
    id: "government", 
    name: t('journey.role_government') || "Gemeinde", 
    icon: MapPin, 
    description: t('profile.role_government_desc') || "Stadtweite Initiativen",
    color: "bg-warning"
  },
  { 
    id: "ngo", 
    name: t('journey.role_ngo') || "Zivilorganisation", 
    icon: Heart, 
    description: t('profile.role_ngo_desc') || "Gemeinschaftsorganisation",
    color: "bg-primary"
  },
];

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm = ({ onSuccess, onSwitchToLogin }: RegisterFormProps) => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsPreview, setShowTermsPreview] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchedRole = watch("role");
  const userRoles = getUserRoles(t);
  const selectedRoleInfo = userRoles.find(role => role.id === watchedRole);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            user_role: data.role,
            organization: data.organization || null,
          },
        },
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: t('auth.registration_success') || "Sikeres regisztráció!",
        description: t('auth.registration_success_desc') || "Üdvözlünk a Káli medence projektben! Ellenőrizd az e-mail fiókodat a fiók megerősítéséhez.",
      });
      
      onSuccess?.();
    } catch (error: unknown) {
      // Handle specific error messages
      const errorObj = error as { message?: string };
      let errorMessage = errorObj.message || '';
      if (errorMessage.includes('already registered')) {
        errorMessage = t('auth.email_already_registered') || 'Ez az e-mail cím már regisztrálva van.';
      }
      
      toast({
        title: t('auth.registration_failed') || "Sikertelen regisztráció",
        description: errorMessage || t('auth.registration_error') || "Valami hiba történt. Kérlek próbáld újra.",
        variant: "destructive",
      });
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setValue("role", roleId as any);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl sm:text-2xl font-bold">{t('journey.step_1_title') || 'Registrierung'}</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {t('journey.step_1_desc') || 'Wähle deine Rolle und erstelle dein Konto'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm sm:text-base">{t('journey.choose_role') || 'Wähle eine Rolle:'}</Label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {userRoles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    className={`p-2 sm:p-3 border rounded-lg text-center transition-all hover:border-primary min-h-[85px] sm:min-h-[90px] flex flex-col items-center justify-center ${
                      watchedRole === role.id 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 mb-1.5 sm:mb-2" />
                    <span className="font-medium text-[11px] sm:text-sm leading-tight break-words w-full px-1">{role.name}</span>
                    <p className="text-[9px] sm:text-xs text-muted-foreground leading-tight mt-0.5 sm:mt-1 line-clamp-2 w-full px-0.5">{role.description}</p>
                  </button>
                );
              })}
            </div>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('profile.first_name') || "Keresztnév"}</Label>
              <Input
                id="firstName"
                type="text"
                placeholder={t('profile.first_name_placeholder') || "János"}
                {...register("firstName")}
                className={errors.firstName ? "border-destructive" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('profile.last_name') || "Vezetéknév"}</Label>
              <Input
                id="lastName"
                type="text"
                placeholder={t('profile.last_name_placeholder') || "Kovács"}
                {...register("lastName")}
                className={errors.lastName ? "border-destructive" : ""}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email_address') || "E-mail cím"}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="pelda@email.hu"
                className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Organization Field */}
          {watchedRole && (
            <div className="space-y-2">
              <Label htmlFor="organization">
                {watchedRole === "citizen" ? (t('profile.company_optional') || "Cég (opcionális)") : 
                 (t('profile.organization_name') || "Szervezet neve")}
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="organization"
                  type="text"
                  placeholder={
                    watchedRole === "citizen" ? (t('profile.company_placeholder') || "Melyik cégnél dolgozol?") :
                    watchedRole === "business" ? (t('profile.business_name_placeholder') || "Cég neve") :
                    watchedRole === "government" ? (t('profile.municipality_placeholder') || "Önkormányzat / Település neve") :
                    (t('profile.organization_placeholder') || "Szervezet neve")
                  }
                  className={`pl-10 ${errors.organization ? "border-destructive" : ""}`}
                  {...register("organization")}
                />
              </div>
              {watchedRole === "citizen" && (
                <p className="text-xs text-muted-foreground">
                  {t('profile.company_help') || "Segíts nekünk nyomon követni a céged regionális hatását"}
                </p>
              )}
              {errors.organization && (
                <p className="text-sm text-destructive">{errors.organization.message}</p>
              )}
            </div>
          )}

          {/* Password Fields */}
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password') || "Jelszó"}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('auth.confirm_password') || "Jelszó megerősítése"}</Label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms of Service & Privacy Policy Checkbox - GDPR Required */}
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="terms-accept-register"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              className="mt-0.5"
            />
            <div className="text-sm leading-relaxed">
              <label htmlFor="terms-accept-register" className="cursor-pointer text-foreground">
                {t('auth.accept_terms_prefix') || "Elfogadom az "}
              </label>
              <a
                href="/aszf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {t('auth.terms_link') || "Általános Szerződési Feltételeket"}
              </a>
              <span className="text-foreground">
                {t('auth.and') || " és az "}
              </span>
              <a
                href="/adatvedelem"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {t('auth.privacy_link') || "Adatvédelmi tájékoztatót"}
              </a>
              <span className="text-foreground">
                {t('auth.accept_terms_suffix') || "."}
              </span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:shadow-glow transition-smooth"
            disabled={isSubmitting || !acceptedTerms}
          >
            {isSubmitting ? (t('auth.creating_account') || "Fiók létrehozása...") : (t('auth.create_account') || "Fiók létrehozása")}
          </Button>
        </form>

        {/* Terms Preview Modal */}
        <TermsModal
          open={showTermsPreview}
          onAccept={() => {
            setAcceptedTerms(true);
            setShowTermsPreview(false);
          }}
          onDecline={() => setShowTermsPreview(false)}
          showDecline={false}
        />
      </CardContent>

      <CardFooter className="text-center">
        <div className="text-sm text-muted-foreground">
          {t('auth.already_have_account') || "Már van fiókod?"}{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-medium"
          >
            {t('auth.sign_in_here') || "Jelentkezz be itt"}
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;