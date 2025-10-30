import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Globe, 
  Users, 
  Target, 
  Heart, 
  Leaf, 
  Zap, 
  Award, 
  TrendingUp,
  MapPin,
  Calendar,
  Mail,
  Linkedin
} from "lucide-react";

const AboutPage = () => {
  const { t } = useLanguage();
  const teamMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "CEO & Founder",
      bio: "Environmental scientist with 15+ years in sustainability research",
      avatar: "SC",
      location: "San Francisco, CA",
      linkedin: "#"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO",
      bio: "Former Google engineer passionate about climate tech solutions",
      avatar: "MR",
      location: "Austin, TX", 
      linkedin: "#"
    },
    {
      name: "Dr. Aisha Patel",
      role: "Head of Impact",
      bio: "Climate policy expert and former UN advisor",
      avatar: "AP",
      location: "New York, NY",
      linkedin: "#"
    },
    {
      name: "Jordan Kim",
      role: "Head of Community",
      bio: "Community builder focused on sustainable behavior change",
      avatar: "JK",
      location: "Portland, OR",
      linkedin: "#"
    }
  ];

  const impactStats = [
    { label: t('about.active_users'), value: "150K+", icon: Users },
    { label: t('about.co2_reduced'), value: "2.3M tons", icon: Leaf },
    { label: t('about.challenges_completed'), value: "500K+", icon: Target },
    { label: t('about.communities_formed'), value: "1,200+", icon: Globe }
  ];

  const milestones = [
    {
      year: "2021",
      title: "Platform Launch",
      description: "Started with a vision to democratize sustainability action"
    },
    {
      year: "2022", 
      title: "100K Users",
      description: "Reached our first major milestone with global community growth"
    },
    {
      year: "2023",
      title: "Corporate Partnerships",
      description: "Partnered with Fortune 500 companies for employee sustainability programs"
    },
    {
      year: "2024",
      title: "AI Integration",
      description: "Launched personalized AI assistant for tailored sustainability guidance"
    }
  ];

  const values = [
    {
      title: "Accessibility",
      description: "Making sustainability action accessible to everyone, regardless of background or resources",
      icon: Heart
    },
    {
      title: "Community First",
      description: "Building strong communities where people support each other's sustainability journey",
      icon: Users
    },
    {
      title: "Science-Based",
      description: "All our recommendations are grounded in peer-reviewed climate science",
      icon: Award
    },
    {
      title: "Continuous Improvement", 
      description: "Always learning and evolving to maximize positive environmental impact",
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-14 sm:pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-primary text-primary-foreground py-12 sm:py-16 lg:py-20 xl:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 xl:mb-8">
              {t('about.title')}
              <span className="block text-primary-glow">{t('about.title_together')}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl max-w-3xl xl:max-w-4xl mx-auto opacity-90 px-4">
              {t('about.subtitle')}
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto">
              <Card className="bg-gradient-to-br from-primary/5 to-primary-glow/5 border-primary/20">
                <CardHeader>
                  <Target className="w-12 h-12 text-primary mb-4" />
                  <CardTitle className="text-2xl">{t('about.our_mission')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('about.mission_text')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/5 to-accent/5 border-secondary/20">
                <CardHeader>
                  <Globe className="w-12 h-12 text-secondary mb-4" />
                  <CardTitle className="text-2xl">{t('about.our_vision')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('about.vision_text')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Impact Statistics */}
        <section className="py-8 sm:py-12 lg:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{t('about.our_global_impact')}</h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                {t('about.creating_change')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto">
              {impactStats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('about.our_values')}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('about.values_subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {values.map((value, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <value.icon className="w-6 h-6 text-primary" />
                      <CardTitle className="text-xl">{value.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('about.our_journey')}</h2>
              <p className="text-xl text-muted-foreground">
                {t('about.journey_subtitle')}
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        {milestone.year}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-8 sm:py-12 lg:py-16 xl:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 xl:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 xl:mb-6">{t('about.meet_our_team')}</h2>
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-muted-foreground px-4">
                {t('about.team_subtitle')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 max-w-6xl xl:max-w-7xl mx-auto">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={`/team-${member.name.toLowerCase().replace(' ', '-')}.jpg`} />
                      <AvatarFallback className="text-xl">{member.avatar}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <Badge variant="secondary" className="mx-auto">{member.role}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                    
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {member.location}
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      <a 
                        href={`mailto:${member.name.toLowerCase().replace(' ', '.')}@sustainhub.com`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                      <a 
                        href={member.linkedin}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-secondary text-secondary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('about.ready_to_make_difference')}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              {t('about.join_community_text')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/dashboard" 
                className="bg-background text-foreground px-8 py-3 rounded-md font-medium hover:bg-background/90 transition-colors"
              >
                {t('about.get_started_now')}
              </a>
              <a 
                href="/community" 
                className="border border-background/20 px-8 py-3 rounded-md font-medium hover:bg-background/10 transition-colors"
              >
                {t('about.join_the_community')}
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;