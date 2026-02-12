import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDashboardUrl } from "@/hooks/useRoleRedirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Users, Sparkles, Building2, ArrowLeft, Check, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_ACCOUNTS } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";

// Monochrome accent colors
const ACCENT_BLACK = "#000000";
const ACCENT_RING = "#111111";

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

  // Redirect if already authenticated - use role-based redirect
  useEffect(() => {
    if (!loading && user && profile) {
      const targetUrl = getDashboardUrl(profile.user_role, profile.is_super_admin);
      navigate(targetUrl, { replace: true });
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

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

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

  // Terms acceptance state
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
      
      // Use centralized role-based redirect logic
      // demoRole is available for demo accounts, otherwise wait for profile to load
      setTimeout(() => {
        if (demoRole) {
          navigate(getDashboardUrl(demoRole, demoRole === 'admin'));
        } else {
          // For real users, redirect to programs (member default) 
          // The useRoleRedirect hook will handle proper redirect once profile loads
          navigate('/programs');
        }
      }, 500);
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
          <Loader2 className="h-4 w-4 animate-spin text-black" />
          <span className="text-black/70">Betöltés...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
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
            <h1 className="text-3xl font-bold text-black tracking-tight">
              WellAgora
            </h1>
          </div>

          {error && (
            <Alert className="mb-6 bg-black/5 border-black/10">
              <AlertDescription className="text-black/70">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-emerald-50 border-emerald-200">
              <AlertDescription className="text-emerald-700">{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/5 rounded-xl p-1 mb-8">
              <TabsTrigger
                value="login"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm text-black/50 font-semibold"
              >
                {t('auth.sign_in') || 'Bejelentkezés'}
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm text-black/50 font-semibold"
              >
                {t('auth.sign_up') || 'Regisztráció'}
              </TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login">
              <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 shadow-xl rounded-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-black mb-2" style={{ lineHeight: '1.5' }}>
                      {t('auth.welcome_back') || 'Üdvözlünk vissza!'}
                    </h2>
                    <p className="text-black/50" style={{ lineHeight: '1.5' }}>
                      {t('auth.enter_details') || 'Kérlek add meg az adataidat'}
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-black/70 text-sm font-semibold">
                        {t('auth.email_address') || 'E-mail'}
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t('auth.email_placeholder') || 'pelda@email.hu'}
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="h-12 bg-black/5 border-black/10 text-black placeholder:text-black/30 rounded-xl focus:ring-2 focus:ring-black/20 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-black/70 text-sm font-semibold">
                          {t('auth.password') || 'Jelszó'}
                        </Label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-black/50 hover:text-black transition-colors"
                        >
                          {t('auth.forgot_password') || 'Elfelejtettem a jelszavam'}
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder={t('auth.password_placeholder') || 'Add meg a jelszavad'}
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="h-12 bg-black/5 border-black/10 text-black placeholder:text-black/30 rounded-xl focus:ring-2 focus:ring-black/20 focus:border-transparent pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70 transition-colors"
                        >
                          {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-black hover:bg-black/90 text-white font-semibold rounded-xl text-base"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('auth.continue') || 'Bejelentkezés'}
                    </Button>
                  </form>

                  {/* Forgot Password Modal */}
                  <AnimatePresence>
                    {showForgotPassword && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowForgotPassword(false)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                        >
                          <h3 className="text-xl font-bold text-black mb-2">
                            {t('auth.reset_password') || 'Jelszó visszaállítása'}
                          </h3>
                          <p className="text-black/60 text-sm mb-6">
                            {t('auth.reset_password_desc') || 'Add meg az e-mail címed és küldünk egy visszaállító linket.'}
                          </p>
                          
                          {resetSuccess ? (
                            <div className="text-center py-4">
                              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-6 h-6 text-emerald-600" />
                              </div>
                              <p className="text-emerald-700 font-medium">
                                {t('auth.reset_email_sent') || 'Elküldtük a visszaállító linket!'}
                              </p>
                              <Button
                                variant="ghost"
                                className="mt-4"
                                onClick={() => {
                                  setShowForgotPassword(false);
                                  setResetSuccess(false);
                                  setResetEmail("");
                                }}
                              >
                                {t('auth.back_to_login') || 'Vissza a bejelentkezéshez'}
                              </Button>
                            </div>
                          ) : (
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                setResetLoading(true);
                                const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                                  redirectTo: `${window.location.origin}/auth?reset=true`,
                                });
                                setResetLoading(false);
                                if (!error) {
                                  setResetSuccess(true);
                                } else {
                                  setError(error.message);
                                }
                              }}
                              className="space-y-4"
                            >
                              <Input
                                type="email"
                                placeholder={t('auth.email_placeholder') || 'pelda@email.hu'}
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                className="h-12 bg-black/5 border-black/10 rounded-xl"
                                required
                              />
                              <div className="flex gap-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => setShowForgotPassword(false)}
                                >
                                  {t('common.cancel') || 'Mégse'}
                                </Button>
                                <Button
                                  type="submit"
                                  className="flex-1 bg-black hover:bg-black/90"
                                  disabled={resetLoading}
                                >
                                  {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  {t('auth.send_reset_link') || 'Link küldése'}
                                </Button>
                              </div>
                            </form>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Demo Login Panel */}
                  <Collapsible className="mt-6 pt-6 border-t border-slate-200">
                    <CollapsibleTrigger className="flex items-center justify-center gap-2 w-full text-sm text-slate-500 hover:text-slate-700 transition-colors">
                      <span>🎭 {t('auth.demo_login')}</span>
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

                  {/* Social Login Options */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-400">
                          {t('auth.or_continue_with') || 'vagy'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        type="button" 
                        className="h-12 border-slate-200 hover:bg-slate-50 rounded-xl"
                        disabled
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                      </Button>
                      <Button 
                        variant="outline" 
                        type="button" 
                        className="h-12 border-slate-200 hover:bg-slate-50 rounded-xl"
                        disabled
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400 text-center mt-3">
                      {t('auth.social_login_soon') || 'Hamarosan elérhető'}
                    </p>
                  </div>
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
                                isSelected ? 'bg-black/10' : 'bg-black/5'
                              }`}
                            >
                              <Icon 
                                className={`w-6 h-6 transition-colors ${isSelected ? 'text-black' : 'text-black/50'}`}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-black" style={{ lineHeight: '1.5' }}>{role.label}</p>
                              <p className="text-sm text-black/50" style={{ lineHeight: '1.5' }}>{role.desc}</p>
                            </div>
                            {isSelected && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 rounded-full bg-black flex items-center justify-center"
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
                            <Label htmlFor="firstName" className="text-black/70 text-sm font-semibold">
                              {t('auth.first_name') || 'Keresztnév'}
                            </Label>
                            <Input
                              id="firstName"
                              placeholder="János"
                              value={signupForm.firstName}
                              onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                              className="h-12 bg-black/5 border-black/10 text-black placeholder:text-black/30 rounded-xl focus:ring-2 focus:ring-black/20 focus:border-transparent"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-black/70 text-sm font-semibold">
                              {t('auth.last_name') || 'Vezetéknév'}
                            </Label>
                            <Input
                              id="lastName"
                              placeholder="Kovács"
                              value={signupForm.lastName}
                              onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                              className="h-12 bg-black/5 border-black/10 text-black placeholder:text-black/30 rounded-xl focus:ring-2 focus:ring-black/20 focus:border-transparent"
                              required
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-black/70 text-sm font-semibold">
                            {t('auth.email_address') || 'E-mail'}
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder={t('auth.email_placeholder') || 'pelda@email.hu'}
                            value={signupForm.email}
                            onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                            className="h-12 bg-black/5 border-black/10 text-black placeholder:text-black/30 rounded-xl focus:ring-2 focus:ring-black/20 focus:border-transparent"
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
                            <Label htmlFor="organization" className="text-black/70 text-sm font-semibold">
                              {t('auth.organization_name') || 'Szervezet neve'}
                            </Label>
                            <Input
                              id="organization"
                              placeholder={t('auth.organization_placeholder') || 'Vállalat Kft.'}
                              value={signupForm.organization}
                              onChange={(e) => setSignupForm({ ...signupForm, organization: e.target.value })}
                              className="h-12 bg-black/5 border-black/10 text-black placeholder:text-black/30 rounded-xl focus:ring-2 focus:ring-black/20 focus:border-transparent"
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
                            <Label htmlFor="bio" className="text-black/70 text-sm font-semibold">
                              {t('auth.expertise') || 'Szakterületed (röviden)'}
                            </Label>
                            <Textarea
                              id="bio"
                              placeholder={t('auth.expertise_placeholder') || 'pl. Hagyományos kézművesség, lekvárfőzés...'}
                              value={signupForm.bio}
                              onChange={(e) => setSignupForm({ ...signupForm, bio: e.target.value })}
                              className="bg-black/5 border-black/10 text-black placeholder:text-black/30 rounded-xl focus:ring-2 focus:ring-black/20 focus:border-transparent min-h-[100px]"
                            />
                          </motion.div>
                        )}

                        {/* Password Fields */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-black/70 text-sm font-semibold">
                              {t('auth.password') || 'Jelszó'}
                            </Label>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showSignupPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={signupForm.password}
                                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                                className="h-12 bg-black/5 border-black/10 text-black placeholder:text-black/30 rounded-xl focus:ring-2 focus:ring-black/20 focus:border-transparent pr-12"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowSignupPassword(!showSignupPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70 transition-colors"
                              >
                                {showSignupPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-black/70 text-sm font-semibold">
                              {t('auth.confirm_password') || 'Jelszó újra'}
                            </Label>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={signupForm.confirmPassword}
                                onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                                className="h-12 bg-black/5 border-black/10 text-black placeholder:text-black/30 rounded-xl focus:ring-2 focus:ring-black/20 focus:border-transparent pr-12"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70 transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Terms & Privacy Checkbox - GDPR Required */}
                        <div className="flex items-start gap-3 py-2">
                          <Checkbox
                            id="terms-accept-signup"
                            checked={acceptedTerms}
                            onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                            className="mt-1"
                          />
                          <label 
                            htmlFor="terms-accept-signup" 
                            className="text-sm text-black/60 leading-relaxed cursor-pointer"
                          >
                            {t('auth.accept_terms_prefix') || 'Elfogadom az '}
                            <Link 
                              to="/aszf" 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {t('auth.terms_link') || 'Általános Szerződési Feltételeket'}
                            </Link>
                            {t('auth.and') || ' és az '}
                            <Link 
                              to="/privacy-policy" 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {t('auth.privacy_link') || 'Adatkezelési tájékoztatót'}
                            </Link>
                            {t('auth.accept_terms_suffix') || '.'}
                          </label>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 bg-black hover:bg-black/90 text-white font-semibold rounded-xl text-base transition-opacity"
                          disabled={isLoading || !acceptedTerms}
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
