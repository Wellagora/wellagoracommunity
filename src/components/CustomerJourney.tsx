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
import { useLanguage } from "@/contexts/LanguageContext";

const CustomerJourney = () => {
  const { t } = useLanguage();
  
  const journeySteps = [
    {
      id: "register",
      title: t('journey.step_1_title'),
      description: t('journey.step_1_desc'),
      icon: User,
      gradient: "from-primary to-success",
      completed: false,
      roles: [
        { type: "citizen", name: t('journey.role_citizen'), icon: "🧑‍🤝‍🧑", color: "bg-primary/10" },
        { type: "business", name: t('journey.role_business'), icon: "🏢", color: "bg-accent/10" },
        { type: "government", name: t('journey.role_government'), icon: "🏛️", color: "bg-warning/10" },
        { type: "ngo", name: t('journey.role_ngo'), icon: "🌱", color: "bg-success/10" }
      ]
    },
    {
      id: "profile",
      title: t('journey.step_2_title'),
      description: t('journey.step_2_desc'),
      icon: Target,
      gradient: "from-accent to-secondary",
      completed: false,
      features: [
        t('journey.feature_personal_data'),
        t('journey.feature_sustainability_goals'),
        t('journey.feature_public_profile'),
        t('journey.feature_contact_info')
      ]
    },
    {
      id: "dashboard",
      title: t('journey.step_3_title'),
      description: t('journey.step_3_desc'),
      icon: Sparkles,
      gradient: "from-success to-primary",
      completed: false,
      features: [
        t('journey.feature_measure_impact'),
        t('journey.feature_complete_challenges'),
        t('journey.feature_join_community'),
        t('journey.feature_earn_points')
      ]
    },
    {
      id: "action",
      title: t('journey.step_4_title'),
      description: t('journey.step_4_desc'),
      icon: Heart,
      gradient: "from-warning to-destructive",
      completed: false,
      organizationFeatures: [
        t('journey.feature_organize_events'),
        t('journey.feature_manage_content'),
        t('journey.feature_build_community'),
        t('journey.feature_analyze_impact')
      ],
      citizenFeatures: [
        t('journey.feature_participate_events'),
        t('journey.feature_complete_challenges_citizen'),
        t('journey.feature_follow_organizations'),
        t('journey.feature_eco_tips')
      ]
    }
  ];

  return (
    <div className="py-8 sm:py-12 lg:py-16 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 sm:opacity-30">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-20 sm:w-32 h-20 sm:h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-24 sm:w-40 h-24 sm:h-40 bg-success/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 sm:w-60 h-40 sm:h-60 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-success rounded-xl sm:rounded-2xl shadow-premium mb-4 sm:mb-6">
            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6 px-2">
            {t('journey.title')}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            {t('journey.subtitle')}
          </p>
        </div>

        {/* Journey Steps */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {journeySteps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div key={step.id} className="relative">
                {/* Connection Line */}
                {index < journeySteps.length - 1 && (
                  <div className="absolute left-6 sm:left-8 top-16 sm:top-20 w-0.5 h-12 sm:h-16 bg-gradient-to-b from-primary/50 to-success/50 z-0 hidden sm:block"></div>
                )}

                <Card className="relative bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                      {/* Step Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r ${step.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-premium`}>
                        <StepIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3 sm:mb-4">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{step.title}</h3>
                          <Badge className="bg-primary/10 text-primary border-primary/20 w-fit text-xs sm:text-sm">
                            {index + 1}. {t('journey.step_label')}
                          </Badge>
                          {step.completed && (
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                          )}
                        </div>
                        
                        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-4 sm:mb-6">
                          {step.description}
                        </p>

                        {/* Role Selection (Step 1) */}
                        {step.id === "register" && (
                          <div className="space-y-3 sm:space-y-4">
                            <h4 className="font-semibold text-foreground text-sm sm:text-base">{t('journey.choose_role')}</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                              {step.roles?.map((role) => (
                                <div key={role.type} className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${role.color} border border-border/30 text-center`}>
                                  <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{role.icon}</div>
                                  <div className="text-xs sm:text-sm font-medium text-foreground">{role.name}</div>
                                </div>
                              ))}
                            </div>
                            <Link to="/auth" className="block">
                              <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300 text-sm sm:text-base">
                                {t('journey.start_registration')}
                                <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </Link>
                          </div>
                        )}

                        {/* Profile Features (Step 2) */}
                        {step.id === "profile" && step.features && (
                          <div className="space-y-3 sm:space-y-4">
                            <h4 className="font-semibold text-foreground text-sm sm:text-base">{t('journey.what_you_can_do')}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                              {step.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                                  <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                                </div>
                              ))}
                            </div>
                            <Link to="/profile" className="block">
                              <Button variant="outline" className="w-full sm:w-auto border-primary/30 hover:bg-primary/10 text-sm sm:text-base">
                                {t('journey.edit_profile')}
                                <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </Link>
                          </div>
                        )}

                        {/* Dashboard Features (Step 3) */}
                        {step.id === "dashboard" && step.features && (
                          <div className="space-y-3 sm:space-y-4">
                            <h4 className="font-semibold text-foreground text-sm sm:text-base">{t('journey.platform_features')}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                              {step.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent flex-shrink-0" />
                                  <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                                </div>
                              ))}
                            </div>
                            <Link to="/dashboard" className="block">
                              <Button variant="outline" className="w-full sm:w-auto border-accent/30 hover:bg-accent/10 text-sm sm:text-base">
                                {t('journey.view_dashboard')}
                                <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </Link>
                          </div>
                        )}

                        {/* Action Features (Step 4) */}
                        {step.id === "action" && (
                          <div className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                              {/* For Organizations */}
                              <div className="p-3 sm:p-4 bg-warning/5 border border-warning/20 rounded-lg sm:rounded-xl">
                                 <h4 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                                   <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-warning" />
                                   {t('journey.for_organizations')}
                                 </h4>
                                 <div className="space-y-1.5 sm:space-y-2">
                                   {step.organizationFeatures?.map((feature, idx) => (
                                     <div key={idx} className="flex items-center space-x-2">
                                       <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning flex-shrink-0" />
                                       <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                                     </div>
                                   ))}
                                 </div>
                                 <Link to="/organization" className="block mt-2 sm:mt-3">
                                   <Button variant="outline" size="sm" className="w-full sm:w-auto border-warning/30 hover:bg-warning/10 text-xs sm:text-sm">
                                     {t('journey.organization_dashboard')}
                                   </Button>
                                 </Link>
                              </div>

                              {/* For Citizens */}
                              <div className="p-3 sm:p-4 bg-success/5 border border-success/20 rounded-lg sm:rounded-xl">
                                 <h4 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                                   <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-success" />
                                   {t('journey.for_individuals')}
                                 </h4>
                                 <div className="space-y-1.5 sm:space-y-2">
                                   {step.citizenFeatures?.map((feature, idx) => (
                                     <div key={idx} className="flex items-center space-x-2">
                                       <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                                       <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                                     </div>
                                   ))}
                                 </div>
                                 <Link to="/community" className="block mt-2 sm:mt-3">
                                   <Button variant="outline" size="sm" className="w-full sm:w-auto border-success/30 hover:bg-success/10 text-xs sm:text-sm">
                                     {t('journey.explore_community')}
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
        <div className="text-center mt-8 sm:mt-12 lg:mt-16">
          <Card className="bg-gradient-to-r from-primary/10 to-success/10 border-primary/20 inline-block max-w-full">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-success rounded-full mx-auto mb-3 sm:mb-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-3 sm:mb-4 px-2">
                {t('journey.ready_to_start')}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto px-4">
                {t('journey.join_champions')}
              </p>
              <Link to="/auth" className="block sm:inline-block">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-premium hover:shadow-glow hover:scale-105 transition-all duration-300 text-sm sm:text-base">
                  {t('journey.start_now')}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
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