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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Users, Sparkles, Building2, ArrowLeft, Check, ChevronDown } from "lucide-react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_ACCOUNTS } from "@/data/mockData";

// Accent colors
const FRESH_GREEN = "#34C759";
const APPLE_BLUE = "#007AFF";

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

    const { error, demoRole } = await signIn(loginForm.email.trim(), loginForm.password);

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
      
      // Demo-specific redirects based on role
      if (demoRole) {
        setTimeout(() => {
          switch (demoRole) {
            case 'sponsor':
              navigate('/tamogatoi-kozpont');
              break;
            case 'expert':
              navigate('/szakertoi-studio');
              break;
            case 'admin':
              navigate('/');
              break;
            default:
              navigate('/iranyitopult');
          }
        }, 500);
      } else {
        // Normal user redirect
        setTimeout(() => navigate("/dashboard"), 1000);
      }
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
    },
    {
      id: 'expert',
      icon: Sparkles,
      label: t('auth.role_expert') || 'Értéket teremtenék',
      desc: t('auth.role_expert_desc') || 'Tudásmegosztás, tiszteletdíj',
    },
    {
      id: 'sponsor',
      icon: Building2,
      label: t('auth.role_sponsor') || 'Közösséget támogatnék',
      desc: t('auth.role_sponsor_desc') || 'ESG hatás, márkaépítés',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: APPLE_BLUE }} />
          <span className="text-slate-700">Betöltés...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mesh Gradient Background - Blue to Green */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, hsl(199 89% 96%) 0%, hsl(166 76% 96%) 40%, hsl(142 71% 96%) 100%)',
        }}
      />
      <div 
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, hsl(199 89% 85% / 0.5) 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, hsl(166 76% 85% / 0.5) 0%, transparent 50%),
                            radial-gradient(circle at 50% 50%, hsl(142 71% 85% / 0.4) 0%, transparent 60%)`,
        }}
      />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Back to Home */}
        <div className="absolute top-6 left-6">
          <Link
            to="/"
            className="flex items-center text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('auth.back_home') || 'Vissza a főoldalra'}
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              WellAgora
            </h1>
          </div>

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
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-xl p-1 mb-8">
              <TabsTrigger
                value="login"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 font-medium"
              >
                {t('auth.sign_in') || 'Bejelentkezés'}
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 font-medium"
              >
                {t('auth.sign_up') || 'Regisztráció'}
              </TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login">
              <Card className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2" style={{ lineHeight: '1.5' }}>
                      {t('auth.welcome_back') || 'Üdvözlünk vissza!'}
                    </h2>
                    <p className="text-slate-500" style={{ lineHeight: '1.5' }}>
                      {t('auth.enter_details') || 'Kérlek add meg az adataidat'}
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-slate-700 text-sm font-medium">
                        {t('auth.email_address') || 'E-mail'}
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t('auth.email_placeholder') || 'pelda@email.hu'}
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': APPLE_BLUE } as React.CSSProperties}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-slate-700 text-sm font-medium">
                        {t('auth.password') || 'Jelszó'}
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder={t('auth.password_placeholder') || 'Add meg a jelszavad'}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': APPLE_BLUE } as React.CSSProperties}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 text-white font-semibold rounded-xl text-base"
                      style={{ backgroundColor: FRESH_GREEN }}
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('auth.continue') || 'Bejelentkezés'}
                    </Button>
                  </form>

                  {/* Demo Login Panel */}
                  <Collapsible className="mt-6 pt-6 border-t border-slate-200">
                    <CollapsibleTrigger className="flex items-center justify-center gap-2 w-full text-sm text-slate-500 hover:text-slate-700 transition-colors">
                      <span>🎭 Demo belépés</span>
                      <ChevronDown className="w-4 h-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="grid grid-cols-2 gap-2">
                        {DEMO_ACCOUNTS.map((acc) => (
                          <Button
                            key={acc.role}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs border-slate-200 hover:bg-slate-50"
                            onClick={() => {
                              setLoginForm({ email: acc.email, password: acc.password });
                            }}
                          >
                            {acc.name}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 text-center mt-3">
                        Kattints, majd nyomd meg a "Bejelentkezés" gombot
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SIGNUP TAB */}
            <TabsContent value="signup">
              <Card className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-2xl">
                <CardContent className="p-8">
                  {/* Role Selection Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2" style={{ lineHeight: '1.5' }}>
                      {t('auth.how_to_join') || 'Hogyan szeretnél csatlakozni?'}
                    </h2>
                    <p className="text-slate-500" style={{ lineHeight: '1.5' }}>
                      {t('auth.select_role_desc') || 'Válaszd ki az utad'}
                    </p>
                  </div>

                  {/* Role Selection Cards - Apple Glassmorphism Style */}
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    {roleOptions.map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.id;
                      return (
                        <motion.div
                          key={role.id}
                          onClick={() => handleRoleSelect(role.id)}
                          className={`
                            p-5 rounded-2xl cursor-pointer transition-all duration-200
                            bg-white/60 backdrop-blur-sm border-2
                            ${isSelected
                              ? 'border-[#007AFF] shadow-lg'
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                            }
                          `}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center gap-4">
                            <div 
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-[#007AFF]/10' : 'bg-slate-100'
                              }`}
                            >
                              <Icon 
                                className="w-6 h-6 transition-colors"
                                style={{ color: isSelected ? APPLE_BLUE : '#64748b' }}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900" style={{ lineHeight: '1.5' }}>{role.label}</p>
                              <p className="text-sm text-slate-500" style={{ lineHeight: '1.5' }}>{role.desc}</p>
                            </div>
                            {isSelected && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: APPLE_BLUE }}
                              >
                                <Check className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Form Fields - Slide in when role is selected */}
                  <AnimatePresence>
                    {selectedRole && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        onSubmit={handleSignup}
                        className="space-y-5 border-t border-slate-200 pt-8 overflow-hidden"
                      >
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-slate-700 text-sm font-medium">
                              {t('auth.first_name') || 'Keresztnév'}
                            </Label>
                            <Input
                              id="firstName"
                              placeholder="János"
                              value={signupForm.firstName}
                              onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                              className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:border-transparent"
                              style={{ '--tw-ring-color': APPLE_BLUE } as React.CSSProperties}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-slate-700 text-sm font-medium">
                              {t('auth.last_name') || 'Vezetéknév'}
                            </Label>
                            <Input
                              id="lastName"
                              placeholder="Kovács"
                              value={signupForm.lastName}
                              onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                              className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:border-transparent"
                              style={{ '--tw-ring-color': APPLE_BLUE } as React.CSSProperties}
                              required
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-700 text-sm font-medium">
                            {t('auth.email_address') || 'E-mail'}
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder={t('auth.email_placeholder') || 'pelda@email.hu'}
                            value={signupForm.email}
                            onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                            className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:border-transparent"
                            style={{ '--tw-ring-color': APPLE_BLUE } as React.CSSProperties}
                            required
                          />
                        </div>

                        {/* Organization field for sponsors */}
                        {selectedRole === 'sponsor' && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="organization" className="text-slate-700 text-sm font-medium">
                              {t('auth.organization_name') || 'Szervezet neve'}
                            </Label>
                            <Input
                              id="organization"
                              placeholder={t('auth.organization_placeholder') || 'Vállalat Kft.'}
                              value={signupForm.organization}
                              onChange={(e) => setSignupForm({ ...signupForm, organization: e.target.value })}
                              className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:border-transparent"
                              style={{ '--tw-ring-color': APPLE_BLUE } as React.CSSProperties}
                            />
                          </motion.div>
                        )}

                        {/* Bio field for experts */}
                        {selectedRole === 'expert' && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="bio" className="text-slate-700 text-sm font-medium">
                              {t('auth.expertise') || 'Szakterületed (röviden)'}
                            </Label>
                            <Textarea
                              id="bio"
                              placeholder={t('auth.expertise_placeholder') || 'pl. Hagyományos kézművesség, lekvárfőzés...'}
                              value={signupForm.bio}
                              onChange={(e) => setSignupForm({ ...signupForm, bio: e.target.value })}
                              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:border-transparent min-h-[100px]"
                              style={{ '--tw-ring-color': APPLE_BLUE } as React.CSSProperties}
                            />
                          </motion.div>
                        )}

                        {/* Password Fields */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 text-sm font-medium">
                              {t('auth.password') || 'Jelszó'}
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              placeholder="••••••••"
                              value={signupForm.password}
                              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                              className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:border-transparent"
                              style={{ '--tw-ring-color': APPLE_BLUE } as React.CSSProperties}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-slate-700 text-sm font-medium">
                              {t('auth.confirm_password') || 'Jelszó újra'}
                            </Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="••••••••"
                              value={signupForm.confirmPassword}
                              onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                              className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:border-transparent"
                              style={{ '--tw-ring-color': APPLE_BLUE } as React.CSSProperties}
                              required
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 text-white font-semibold rounded-xl text-base hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: FRESH_GREEN }}
                          disabled={isLoading}
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t('auth.create_account') || 'Fiók létrehozása'}
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>
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
