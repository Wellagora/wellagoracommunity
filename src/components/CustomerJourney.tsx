import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Building2, 
  MapPin, 
  Users,
  ArrowRight,
  CheckCircle,
  Target,
  Heart,
  Sparkles,
  Calendar,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";

const CustomerJourney = () => {
  const journeySteps = [
    {
      id: "register",
      title: "Regisztráció",
      description: "Válaszd ki a szereped és hozd létre a fiókod",
      icon: User,
      gradient: "from-primary to-success",
      completed: false,
      roles: [
        { type: "citizen", name: "Magánszemély", icon: "🧑‍🤝‍🧑", color: "bg-primary/10" },
        { type: "business", name: "Vállalkozás", icon: "🏢", color: "bg-accent/10" },
        { type: "government", name: "Önkormányzat", icon: "🏛️", color: "bg-warning/10" },
        { type: "ngo", name: "Civil Szervezet", icon: "🌱", color: "bg-success/10" }
      ]
    },
    {
      id: "profile",
      title: "Profil kiegészítése",
      description: "Add meg a részletes adataidat és célokat",
      icon: Target,
      gradient: "from-accent to-secondary",
      completed: false,
      features: [
        "Személyes/szervezeti adatok",
        "Fenntarthatósági célok",
        "Nyilvános profil beállítása",
        "Kapcsolattartási információk"
      ]
    },
    {
      id: "dashboard",
      title: "Dashboard felfedezése",
      description: "Ismerd meg a lehetőségeket és kezdj el nyomon követni",
      icon: Sparkles,
      gradient: "from-success to-primary",
      completed: false,
      features: [
        "Hatás mérése és követése",
        "Kihívások teljesítése",
        "Közösséghez csatlakozás",
        "Pontok és jutalmak gyűjtése"
      ]
    },
    {
      id: "action",
      title: "Cselekvés és kapcsolódás",
      description: "Szervezz eseményeket vagy csatlakozz másokhoz",
      icon: Heart,
      gradient: "from-warning to-destructive",
      completed: false,
      organizationFeatures: [
        "Események szervezése",
        "Tartalom kezelése",
        "Közösség építése",
        "Hatás elemzése"
      ],
      citizenFeatures: [
        "Eseményeken részvétel",
        "Kihívások teljesítése",
        "Szervezetek követése",
        "Környezetbarát tippek"
      ]
    }
  ];

  return (
    <div className="py-16 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-success/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-success rounded-2xl shadow-premium mb-6">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Fenntarthatósági útvonalad
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Kezdd el a fenntartható jövő felé vezető utazásod négy egyszerű lépésben. 
            Legyen szó személyes célokról vagy szervezeti kezdeményezésekről.
          </p>
        </div>

        {/* Journey Steps */}
        <div className="space-y-8">
          {journeySteps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div key={step.id} className="relative">
                {/* Connection Line */}
                {index < journeySteps.length - 1 && (
                  <div className="absolute left-8 top-20 w-0.5 h-16 bg-gradient-to-b from-primary/50 to-success/50 z-0"></div>
                )}

                <Card className="relative bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      {/* Step Icon */}
                      <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-2xl flex items-center justify-center shadow-premium`}>
                        <StepIcon className="w-8 h-8 text-white" />
                      </div>

                      {/* Step Content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            {index + 1}. lépés
                          </Badge>
                          {step.completed && (
                            <CheckCircle className="w-6 h-6 text-success" />
                          )}
                        </div>
                        
                        <p className="text-lg text-muted-foreground mb-6">
                          {step.description}
                        </p>

                        {/* Role Selection (Step 1) */}
                        {step.id === "register" && (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-foreground">Válassz szerepet:</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              {step.roles?.map((role) => (
                                <div key={role.type} className={`p-4 rounded-xl ${role.color} border border-border/30 text-center`}>
                                  <div className="text-2xl mb-2">{role.icon}</div>
                                  <div className="text-sm font-medium text-foreground">{role.name}</div>
                                </div>
                              ))}
                            </div>
                            <Link to="/auth">
                              <Button className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300">
                                Regisztráció indítása
                                <ArrowRight className="ml-2 w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        )}

                        {/* Profile Features (Step 2) */}
                        {step.id === "profile" && step.features && (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-foreground">Mit tehetsz meg:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {step.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground">{feature}</span>
                                </div>
                              ))}
                            </div>
                            <Link to="/profile">
                              <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                                Profil szerkesztése
                                <ArrowRight className="ml-2 w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        )}

                        {/* Dashboard Features (Step 3) */}
                        {step.id === "dashboard" && step.features && (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-foreground">Platform funkciók:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {step.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                  <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground">{feature}</span>
                                </div>
                              ))}
                            </div>
                            <Link to="/dashboard">
                              <Button variant="outline" className="border-accent/30 hover:bg-accent/10">
                                Dashboard megtekintése
                                <ArrowRight className="ml-2 w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        )}

                        {/* Action Features (Step 4) */}
                        {step.id === "action" && (
                          <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* For Organizations */}
                              <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl">
                                <h4 className="font-semibold text-foreground mb-3 flex items-center">
                                  <Building2 className="w-4 h-4 mr-2 text-warning" />
                                  Szervezetek számára:
                                </h4>
                                <div className="space-y-2">
                                  {step.organizationFeatures?.map((feature, idx) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                      <Calendar className="w-4 h-4 text-warning flex-shrink-0" />
                                      <span className="text-sm text-muted-foreground">{feature}</span>
                                    </div>
                                  ))}
                                </div>
                                <Link to="/organization" className="block mt-3">
                                  <Button variant="outline" size="sm" className="border-warning/30 hover:bg-warning/10">
                                    Szervezeti Dashboard
                                  </Button>
                                </Link>
                              </div>

                              {/* For Citizens */}
                              <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
                                <h4 className="font-semibold text-foreground mb-3 flex items-center">
                                  <User className="w-4 h-4 mr-2 text-success" />
                                  Magánszemélyek számára:
                                </h4>
                                <div className="space-y-2">
                                  {step.citizenFeatures?.map((feature, idx) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                      <Heart className="w-4 h-4 text-success flex-shrink-0" />
                                      <span className="text-sm text-muted-foreground">{feature}</span>
                                    </div>
                                  ))}
                                </div>
                                <Link to="/community" className="block mt-3">
                                  <Button variant="outline" size="sm" className="border-success/30 hover:bg-success/10">
                                    Közösség felfedezése
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-primary/10 to-success/10 border-primary/20 inline-block">
            <CardContent className="p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary to-success rounded-full mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Készen állsz a kezdésre?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Csatlakozz több mint 1,500 fenntarthatósági bajnokhoz, akik már most építik a jövőt!
              </p>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground font-semibold px-8 py-3 rounded-xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300">
                  Indítsd el most
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerJourney;