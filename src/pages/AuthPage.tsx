import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Users, Sparkles, Building2, ArrowLeft, Check } from "lucide-react";
import { z } from "zod";

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, signIn, signUp, loading } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get role and referral code from URL parameters
  const roleFromUrl = searchParams.get('role');
  const refCodeFromUrl = searchParams.get('ref');

  // Role selection state
  const [selectedRole, setSelectedRole] = useState<string>(roleFromUrl || '');

  // Validation schemas
  const loginSchema = z.object({
    email: z.string().email(t('auth.email_invalid')),
    password: z.string().min(6, t('auth.password_min')),
  });

  const signupSchema = z.object({
    email: z.string().email(t('auth.email_invalid')),
    password: z.string().min(6, t('auth.password_min')),
    confirmPassword: z.string(),
    firstName: z.string().min(1, t('auth.first_name_required')).max(50, t('auth.first_name_max')),
    lastName: z.string().min(1, t('auth.last_name_required')).max(50, t('auth.last_name_max')),
    role: z.enum(["member", "expert", "sponsor"], {
      message: t('auth.role_required')
    }),
    organization: z.string().max(100, t('auth.organization_max')).optional(),
    bio: z.string().max(500).optional(),
    industry: z.string().max(100).optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.password_match'),
    path: ["confirmPassword"],
  });

  // Store referral code in localStorage on mount
  useEffect(() => {
    if (refCodeFromUrl) {
      localStorage.setItem('referral_code', refCodeFromUrl);
    }
  }, [refCodeFromUrl]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user && profile) {
      navigate("/dashboard");
    }
  }, [user, profile, loading, navigate]);

  // Update selected role if URL parameter changes
  useEffect(() => {
    if (roleFromUrl) {
      setSelectedRole(roleFromUrl);
    }
  }, [roleFromUrl]);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    organization: "",
    bio: "",
    industry: "",
  });

  const handleRoleSelect = (roleId: string) => {
    console.log('Selecting role:', roleId);
    setSelectedRole(roleId);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      loginSchema.parse(loginForm);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signIn(loginForm.email.trim(), loginForm.password);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError(t('auth.invalid_credentials'));
      } else if (error.message.includes("Email not confirmed")) {
        setError(t('auth.email_not_confirmed'));
      } else {
        setError(error.message || t('auth.login_error'));
      }
    } else {
      setSuccess(t('auth.login_successful'));
      setTimeout(() => navigate("/dashboard"), 1000);
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = {
      ...signupForm,
      role: selectedRole,
    };

    try {
      signupSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signUp({
      email: signupForm.email.trim(),
      password: signupForm.password,
      firstName: signupForm.firstName.trim(),
      lastName: signupForm.lastName.trim(),
      role: selectedRole,
      organization: signupForm.organization?.trim() || undefined,
      bio: signupForm.bio?.trim() || undefined,
      industry: signupForm.industry?.trim() || undefined,
    });

    if (error) {
      if (error.message.includes("User already registered")) {
        setError(t('auth.account_exists'));
      } else if (error.message.includes("Password should be at least")) {
        setError(t('auth.password_short'));
      } else if (error.message.includes("Invalid email")) {
        setError(t('auth.email_invalid_error'));
      } else {
        setError(error.message || t('auth.signup_error'));
      }
    } else {
      setSuccess(t('auth.account_created'));

      const storedRefCode = localStorage.getItem('referral_code');
      if (storedRefCode) {
        localStorage.removeItem('referral_code');
      }
    }

    setIsLoading(false);
  };

  const roleOptions = [
    {
      id: 'member',
      icon: Users,
      label: t('auth.role_member') || 'Felfedezni szeretnék',
      desc: t('auth.role_member_desc') || 'Kuponok, események, közösség',
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      selectedBg: 'bg-cyan-50',
      selectedBorder: 'border-cyan-500',
      checkBg: 'bg-cyan-500',
    },
    {
      id: 'expert',
      icon: Sparkles,
      label: t('auth.role_expert') || 'Értéket teremtenék',
      desc: t('auth.role_expert_desc') || 'Tudásmegosztás, tiszteletdíj',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      selectedBg: 'bg-violet-50',
      selectedBorder: 'border-violet-500',
      checkBg: 'bg-violet-500',
    },
    {
      id: 'sponsor',
      icon: Building2,
      label: t('auth.role_sponsor') || 'Közösséget támogatnék',
      desc: t('auth.role_sponsor_desc') || 'ESG hatás, márkaépítés',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      selectedBg: 'bg-amber-50',
      selectedBorder: 'border-amber-500',
      checkBg: 'bg-amber-500',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
          <span className="text-slate-700">Betöltés...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Back to Home */}
        <div className="absolute top-4 left-4">
          <Link
            to="/"
            className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('auth.back_home') || 'Vissza a főoldalra'}
          </Link>
        </div>

        <div className="w-full max-w-lg">
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 border border-slate-200 mb-6">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600"
              >
                {t('auth.sign_in') || 'Bejelentkezés'}
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600"
              >
                {t('auth.sign_up') || 'Regisztráció'}
              </TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login">
              <Card className="bg-white border border-slate-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {t('auth.welcome_back') || 'Üdvözlünk vissza!'}
                    </h2>
                    <p className="text-slate-600">
                      {t('auth.enter_details') || 'Kérlek add meg az adataidat'}
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-slate-700">
                        {t('auth.email_address') || 'E-mail'}
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t('auth.email_placeholder') || 'pelda@email.hu'}
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-slate-700">
                        {t('auth.password') || 'Jelszó'}
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder={t('auth.password_placeholder') || 'Add meg a jelszavad'}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('auth.continue') || 'Bejelentkezés'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SIGNUP TAB */}
            <TabsContent value="signup">
              <Card className="bg-white border border-slate-200 shadow-lg">
                <CardContent className="p-6">
                  {/* Role Selection Header */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {t('auth.how_to_join') || 'Hogyan szeretnél csatlakozni?'}
                    </h2>
                    <p className="text-slate-600">
                      {t('auth.select_role_desc') || 'Válaszd ki az utad'}
                    </p>
                  </div>

                  {/* Role Selection Cards - Simple, no Framer Motion */}
                  <div className="grid grid-cols-1 gap-3 mb-6">
                    {roleOptions.map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.id;
                      return (
                        <div
                          key={role.id}
                          onClick={() => handleRoleSelect(role.id)}
                          className={`
                            p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                            ${isSelected
                              ? `${role.selectedBg} ${role.selectedBorder}`
                              : 'border-slate-200 bg-white hover:border-slate-300'
                            }
                          `}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl ${role.iconBg} flex items-center justify-center`}>
                              <Icon className={`w-6 h-6 ${role.iconColor}`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-900">{role.label}</p>
                              <p className="text-sm text-slate-600">{role.desc}</p>
                            </div>
                            {isSelected && (
                              <div className={`w-6 h-6 rounded-full ${role.checkBg} flex items-center justify-center`}>
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Form Fields - Appear when role is selected */}
                  {selectedRole && (
                    <form onSubmit={handleSignup} className="space-y-4 border-t border-slate-200 pt-6">
                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-slate-700">
                            {t('auth.first_name') || 'Keresztnév'}
                          </Label>
                          <Input
                            id="firstName"
                            placeholder="János"
                            value={signupForm.firstName}
                            onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                            className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-slate-700">
                            {t('auth.last_name') || 'Vezetéknév'}
                          </Label>
                          <Input
                            id="lastName"
                            placeholder="Kovács"
                            value={signupForm.lastName}
                            onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                            className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700">
                          {t('auth.email_address') || 'E-mail'}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t('auth.email_placeholder') || 'pelda@email.hu'}
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500"
                          required
                        />
                      </div>

                      {/* Organization field for sponsors */}
                      {selectedRole === 'sponsor' && (
                        <div className="space-y-2">
                          <Label htmlFor="organization" className="text-slate-700">
                            {t('auth.organization_name') || 'Szervezet neve'}
                          </Label>
                          <Input
                            id="organization"
                            placeholder={t('auth.organization_placeholder') || 'Vállalat Kft.'}
                            value={signupForm.organization}
                            onChange={(e) => setSignupForm({ ...signupForm, organization: e.target.value })}
                            className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500"
                            required
                          />
                        </div>
                      )}

                      {/* Bio field for experts */}
                      {selectedRole === 'expert' && (
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-slate-700">
                            {t('auth.bio') || 'Bemutatkozás'}
                          </Label>
                          <Textarea
                            id="bio"
                            placeholder={t('auth.bio_placeholder') || 'Rövid bemutatkozás...'}
                            value={signupForm.bio}
                            onChange={(e) => setSignupForm({ ...signupForm, bio: e.target.value })}
                            className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 min-h-[80px]"
                          />
                        </div>
                      )}

                      {/* Password */}
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-700">
                          {t('auth.password') || 'Jelszó'}
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder={t('auth.create_password') || 'Hozz létre egy jelszót'}
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                          className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500"
                          required
                        />
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-slate-700">
                          {t('auth.confirm_password') || 'Jelszó megerősítése'}
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder={t('auth.confirm_password_placeholder') || 'Írd be újra a jelszavad'}
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                          className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500"
                          required
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('auth.create_account') || 'Fiók létrehozása'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;