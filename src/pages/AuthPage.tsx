import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Leaf, Users, Target, Globe } from "lucide-react";
import { z } from "zod";

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    role: z.enum(["citizen", "business", "government", "ngo"], { 
      message: t('auth.role_required') 
    }),
    organization: z.string().max(100, t('auth.organization_max')).optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.password_match'),
    path: ["confirmPassword"],
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

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
    role: "",
    organization: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validate input
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
      console.error("Login error:", error);
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

    // Validate input
    try {
      signupSchema.parse(signupForm);
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
      role: signupForm.role,
      organization: signupForm.organization?.trim() || undefined,
    });

    if (error) {
      console.error("Signup error:", error);
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
    }
    
    setIsLoading(false);
  };

  const features = [
    {
      icon: CheckCircle,
      title: "Track your sustainable impact",
      description: "Monitor your carbon footprint reduction"
    },
    {
      icon: Users,
      title: "Join a vibrant community",
      description: "Connect with like-minded sustainability advocates"
    },
    {
      icon: Target,
      title: "Set and achieve green goals",
      description: "Create personalized sustainability targets"
    },
    {
      icon: Globe,
      title: "Make a global difference",
      description: "Contribute to worldwide environmental initiatives"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center modern-tech bg-gradient-hero">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary-glow" />
          <span className="text-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Geometric background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        
        {/* Geometric lines */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-accent/20 via-accent/10 to-transparent transform skew-y-1" />
        <div className="absolute bottom-0 right-0 w-full h-40 bg-gradient-to-t from-primary/20 via-primary/10 to-transparent transform -skew-y-2" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Left side - Features */}
        <div className="hidden lg:flex flex-1 flex-col justify-center px-6 sm:px-8 lg:px-12 xl:px-20 2xl:px-24">
          <div className="max-w-lg xl:max-w-xl">
            {/* Logo and brand */}
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4 border border-primary/30">
                <Leaf className="w-6 h-6 text-primary-glow" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Wellagora</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Sustainability Platform</p>
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold text-foreground mb-6 xl:mb-8 leading-tight">
              Join the future of 
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                sustainable living
              </span>
            </h2>

            {/* Features list */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-3 group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success/20 flex items-center justify-center mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-success" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium group-hover:text-primary-glow transition-colors">
                        {feature.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-sm text-muted-foreground">
              Trusted by <span className="text-primary-glow font-semibold">1,500+</span> sustainability advocates worldwide
            </p>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex-shrink-0 w-full max-w-md xl:max-w-lg p-4 sm:p-6 lg:p-12 xl:p-16">
          <div className="flex flex-col justify-center min-h-full">
            <div className="w-full">
              {/* Auth form header */}
              <div className="text-center mb-8 xl:mb-10">
                <div className="w-16 h-16 xl:w-20 xl:h-20 mx-auto mb-4 xl:mb-6 bg-card/80 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-border/50">
                  <Users className="w-8 h-8 xl:w-10 xl:h-10 text-primary-glow" />
                </div>
                <h3 className="text-2xl xl:text-3xl font-bold text-foreground mb-2">Welcome back!</h3>
                <p className="text-sm xl:text-base text-muted-foreground">Please enter your details</p>
              </div>

              {error && (
                <Alert className="mb-6 bg-destructive/10 border-destructive/30">
                  <AlertDescription className="text-destructive-foreground">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 bg-success/10 border-success/30">
                  <AlertDescription className="text-success-foreground">{success}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm border border-border/50">
                  <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email" className="text-foreground">Email</Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="your.email@gmail.com"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                            className="bg-background/50 backdrop-blur-sm border-border/50 text-foreground placeholder:text-muted-foreground"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password" className="text-foreground">Password</Label>
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            className="bg-background/50 backdrop-blur-sm border-border/50 text-foreground placeholder:text-muted-foreground"
                            required
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-accent hover:bg-accent-light text-accent-foreground font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-glow" 
                          disabled={isLoading}
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Continue
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                  
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Don't have an account yet?{" "}
                    <button
                      onClick={() => {
                        const signupTab = document.querySelector('[data-value="signup"]') as HTMLElement;
                        signupTab?.click();
                      }}
                      className="text-primary-glow hover:text-primary transition-colors font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </TabsContent>

                <TabsContent value="signup">
                  <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                            <Input
                              id="firstName"
                              placeholder="John"
                              value={signupForm.firstName}
                              onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                              className="bg-background/50 backdrop-blur-sm border-border/50 text-foreground placeholder:text-muted-foreground"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                            <Input
                              id="lastName"
                              placeholder="Doe"
                              value={signupForm.lastName}
                              onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                              className="bg-background/50 backdrop-blur-sm border-border/50 text-foreground placeholder:text-muted-foreground"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="your.email@gmail.com"
                            value={signupForm.email}
                            onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                            className="bg-background/50 backdrop-blur-sm border-border/50 text-foreground placeholder:text-muted-foreground"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-foreground">Role</Label>
                          <Select value={signupForm.role} onValueChange={(value) => setSignupForm({ ...signupForm, role: value })}>
                            <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 text-foreground">
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border/50">
                              <SelectItem value="citizen">🧑‍🤝‍🧑 Magánszemély</SelectItem>
                              <SelectItem value="business">🏢 Vállalkozás</SelectItem>
                              <SelectItem value="government">🏛️ Önkormányzat</SelectItem>
                              <SelectItem value="ngo">🌱 Civil Szervezet (NGO)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {(signupForm.role === "business" || signupForm.role === "government" || signupForm.role === "ngo") && (
                          <div className="space-y-2">
                            <Label htmlFor="organization" className="text-foreground">Szervezet neve</Label>
                            <Input
                              id="organization"
                              value={signupForm.organization}
                              onChange={(e) => setSignupForm({ ...signupForm, organization: e.target.value })}
                              placeholder={
                                signupForm.role === "business" ? "Pl. Green Tech Kft." :
                                signupForm.role === "government" ? "Pl. Budapest IV. kerület" :
                                "Pl. Greenpeace Magyarország"
                              }
                              className="bg-background/50 backdrop-blur-sm border-border/50 text-foreground placeholder:text-muted-foreground"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Create a password"
                            value={signupForm.password}
                            onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                            className="bg-background/50 backdrop-blur-sm border-border/50 text-foreground placeholder:text-muted-foreground"
                            required
                            minLength={6}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={signupForm.confirmPassword}
                            onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                            className="bg-background/50 backdrop-blur-sm border-border/50 text-foreground placeholder:text-muted-foreground"
                            required
                            minLength={6}
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-accent hover:bg-accent-light text-accent-foreground font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-glow" 
                          disabled={isLoading}
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Account
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                  
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        const loginTab = document.querySelector('[data-value="login"]') as HTMLElement;
                        loginTab?.click();
                      }}
                      className="text-primary-glow hover:text-primary transition-colors font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </TabsContent>
              </Tabs>

              <div className="text-center mt-8">
                <a 
                  href="/" 
                  className="text-sm text-muted-foreground hover:text-primary-glow transition-colors inline-flex items-center"
                >
                  ← Back to home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;