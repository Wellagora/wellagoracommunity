import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Building2,
  MapPin,
  Heart,
  BarChart3,
  Users,
  Target,
  Award,
  TrendingUp,
  Calendar,
  MessageSquare,
  Settings
} from "lucide-react";

const StakeholderSection = () => {
  const stakeholders = [
    {
      type: "Citizens",
      icon: User,
      color: "success",
      description: "Individual sustainability journey with AI coaching",
      features: [
        "Personalized challenge recommendations",
        "AI sustainability coach 'WellBot'",
        "Points, badges & achievement system",
        "Community connections & forums",
        "Impact tracking & visualization",
        "Local challenge participation"
      ],
      dashboard: {
        title: "Personal Dashboard",
        metrics: ["Personal CO₂ Saved", "Challenges Completed", "Community Rank", "Weekly Streak"]
      }
    },
    {
      type: "Businesses",
      icon: Building2,
      color: "accent",
      description: "Corporate sustainability goals with team engagement",
      features: [
        "Employee engagement analytics",
        "Custom corporate challenges",
        "ESG reporting automation",
        "Team competitions & leaderboards",
        "Brand visibility opportunities",
        "Supply chain collaboration"
      ],
      dashboard: {
        title: "Business Dashboard",
        metrics: ["Team Participation", "Sustainability ROI", "Brand Engagement", "ESG Metrics"]
      }
    },
    {
      type: "Municipal",
      icon: MapPin,
      color: "warning",
      description: "City-wide coordination and policy impact measurement",
      features: [
        "City-wide engagement analytics",
        "Policy impact measurement",
        "Cross-department coordination",
        "Citizen participation tracking",
        "Public campaign management",
        "Regional collaboration tools"
      ],
      dashboard: {
        title: "Municipal Dashboard",
        metrics: ["Citizen Engagement", "Policy Impact", "District Progress", "Budget Allocation"]
      }
    },
    {
      type: "NGOs",
      icon: Heart,
      color: "primary",
      description: "Community organization and volunteer coordination",
      features: [
        "Project management tools",
        "Volunteer coordination system",
        "Impact documentation & reporting",
        "Partnership facilitation",
        "Community outreach tracking",
        "Fundraising integration"
      ],
      dashboard: {
        title: "NGO Dashboard",
        metrics: ["Project Progress", "Volunteer Hours", "Community Impact", "Partnership Growth"]
      }
    }
  ];

  return (
    <section id="stakeholders" className="py-20 bg-gradient-nature">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            Multi-Stakeholder Platform
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Tailored for Every{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Sustainability Actor
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From individual citizens to municipal governments, our platform provides 
            specialized tools and dashboards for every type of sustainability stakeholder.
          </p>
        </div>

        {/* Stakeholder Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {stakeholders.map((stakeholder, index) => (
            <Card 
              key={stakeholder.type} 
              className="relative overflow-hidden shadow-card hover:shadow-eco transition-smooth group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-${stakeholder.color} rounded-xl flex items-center justify-center`}>
                    <stakeholder.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">{stakeholder.type}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {stakeholder.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {/* Features List */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Key Features:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {stakeholder.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dashboard Preview */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h5 className="font-medium text-foreground mb-3 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      {stakeholder.dashboard.title}
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      {stakeholder.dashboard.metrics.map((metric, idx) => (
                        <div key={idx} className="text-xs text-muted-foreground bg-card/50 rounded px-2 py-1">
                          {metric}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary/5 transition-smooth"
                  >
                    Explore {stakeholder.type} Features
                  </Button>
                </div>
              </CardContent>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-smooth pointer-events-none"></div>
            </Card>
          ))}
        </div>

        {/* Integration Showcase */}
        <div className="text-center">
          <Card className="bg-gradient-earth text-white border-0 shadow-glow">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Seamless Integration Across Stakeholders</h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                All stakeholder types work together in one unified platform, sharing data, 
                collaborating on challenges, and amplifying collective impact.
              </p>
              <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
                See Integration Features
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StakeholderSection;