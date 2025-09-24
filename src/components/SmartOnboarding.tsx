import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Heart, 
  Target, 
  Users,
  Leaf,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Home,
  Building,
  GraduationCap
} from "lucide-react";

interface SmartOnboardingProps {
  onComplete: () => void;
  userType?: "citizen" | "business" | "government" | "ngo";
}

const SmartOnboarding = ({ onComplete, userType = "citizen" }: SmartOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  const steps = [
    {
      title: "Welcome to Your Sustainability Journey! 🌱",
      subtitle: "Let's personalize your experience",
      component: "welcome"
    },
    {
      title: "What interests you most?",
      subtitle: "We'll customize your experience based on your interests",
      component: "interests"
    },
    {
      title: "Where are you located?",
      subtitle: "Connect with local initiatives and challenges",
      component: "location"
    },
    {
      title: "You're all set! 🎉",
      subtitle: "Your personalized sustainability dashboard awaits",
      component: "complete"
    }
  ];

  const interests = [
    { id: "energy", label: "Renewable Energy", icon: "⚡", color: "bg-yellow-100 text-yellow-800" },
    { id: "transport", label: "Green Transport", icon: "🚲", color: "bg-blue-100 text-blue-800" },
    { id: "waste", label: "Zero Waste", icon: "♻️", color: "bg-success/10 text-success" },
    { id: "food", label: "Sustainable Food", icon: "🌿", color: "bg-emerald-100 text-emerald-800" },
    { id: "community", label: "Community Action", icon: "👥", color: "bg-purple-100 text-purple-800" },
    { id: "water", label: "Water Conservation", icon: "💧", color: "bg-cyan-100 text-cyan-800" },
    { id: "biodiversity", label: "Wildlife Protection", icon: "🦋", color: "bg-pink-100 text-pink-800" },
    { id: "education", label: "Environmental Education", icon: "📚", color: "bg-orange-100 text-orange-800" }
  ];

  const locations = [
    "Munich, Germany", "Berlin, Germany", "Hamburg, Germany", "Frankfurt, Germany",
    "Cologne, Germany", "Stuttgart, Germany", "Düsseldorf, Germany", "Other"
  ];

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getUserTypeInfo = () => {
    switch (userType) {
      case "business":
        return {
          icon: Building,
          title: "Corporate Sustainability",
          description: "Transform your business with sustainable practices"
        };
      case "government":
        return {
          icon: Home,
          title: "Municipal Leadership",
          description: "Drive regional sustainability initiatives"
        };
      case "ngo":
        return {
          icon: Heart,
          title: "Community Impact",
          description: "Amplify your organization's environmental mission"
        };
      default:
        return {
          icon: Users,
          title: "Personal Impact",
          description: "Start your individual sustainability journey"
        };
    }
  };

  const userTypeInfo = getUserTypeInfo();
  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderWelcome = () => (
    <div className="text-center space-y-6">
      <div className="relative mx-auto w-32 h-32">
        <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-20 animate-pulse"></div>
        <div className="relative w-full h-full bg-gradient-primary rounded-full flex items-center justify-center">
          <userTypeInfo.icon className="w-16 h-16 text-white" />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-heading font-bold mb-2">{userTypeInfo.title}</h2>
        <p className="text-muted-foreground">{userTypeInfo.description}</p>
      </div>

      <div className="bg-gradient-primary/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-semibold">What makes Wellagora special?</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>AI-powered personalization</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>Real community impact</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>Gamified progress tracking</span>
          </div>
        </div>
      </div>

      <Badge className="bg-success/10 text-success border-success/20 px-4 py-2">
        <Heart className="w-4 h-4 mr-2" />
        Join 50,000+ sustainability champions
      </Badge>
    </div>
  );

  const renderInterests = () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">Select all that apply - we'll personalize your experience</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {interests.map((interest) => (
          <button
            key={interest.id}
            onClick={() => handleInterestToggle(interest.id)}
            className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
              selectedInterests.includes(interest.id)
                ? 'border-primary bg-primary/10 shadow-glow'
                : 'border-muted hover:border-primary/50'
            }`}
          >
            <div className="text-2xl mb-2">{interest.icon}</div>
            <div className="text-sm font-medium text-center">{interest.label}</div>
          </button>
        ))}
      </div>

      <div className="bg-accent/10 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          <strong>{selectedInterests.length} interests selected</strong> - 
          {selectedInterests.length === 0 && " Choose at least one to continue"}
          {selectedInterests.length > 0 && " Great choices! This helps us personalize your experience."}
        </p>
      </div>
    </div>
  );

  const renderLocation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">
          We'll connect you with local initiatives, events, and like-minded people in your area
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {locations.map((location) => (
          <button
            key={location}
            onClick={() => setSelectedLocation(location)}
            className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-105 ${
              selectedLocation === location
                ? 'border-primary bg-primary/10 shadow-glow'
                : 'border-muted hover:border-primary/50'
            }`}
          >
            <div className="font-medium">{location}</div>
          </button>
        ))}
      </div>

      {selectedLocation && (
        <div className="bg-success/10 rounded-xl p-4 border border-success/20">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="font-medium">Perfect! You're connected to {selectedLocation}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            We found <strong>234 active members</strong> and <strong>12 ongoing initiatives</strong> in your area!
          </p>
        </div>
      )}
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-6">
      <div className="relative mx-auto w-32 h-32">
        <div className="absolute inset-0 bg-gradient-primary rounded-full animate-pulse"></div>
        <div className="relative w-full h-full bg-gradient-primary rounded-full flex items-center justify-center">
          <CheckCircle className="w-16 h-16 text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-heading font-bold mb-2">Welcome to the community! 🎉</h2>
        <p className="text-muted-foreground">Your personalized dashboard is ready</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-glass backdrop-blur-md rounded-xl p-4 border border-white/20">
          <Target className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="font-semibold">Personalized Challenges</div>
          <div className="text-sm text-muted-foreground">Based on your interests</div>
        </div>
        <div className="bg-glass backdrop-blur-md rounded-xl p-4 border border-white/20">
          <Users className="w-8 h-8 text-success mx-auto mb-2" />
          <div className="font-semibold">Local Community</div>
          <div className="text-sm text-muted-foreground">Connect with {selectedLocation}</div>
        </div>
        <div className="bg-glass backdrop-blur-md rounded-xl p-4 border border-white/20">
          <Leaf className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="font-semibold">Impact Tracking</div>
          <div className="text-sm text-muted-foreground">See your difference</div>
        </div>
      </div>

      <Badge className="bg-warning/10 text-warning border-warning/20 px-4 py-2">
        🎁 Bonus: +100 starter points added to your account!
      </Badge>
    </div>
  );

  const renderCurrentStep = () => {
    switch (steps[currentStep].component) {
      case "welcome": return renderWelcome();
      case "interests": return renderInterests();
      case "location": return renderLocation();
      case "complete": return renderComplete();
      default: return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedInterests.length > 0;
      case 2: return selectedLocation !== "";
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-glass backdrop-blur-xl border-2 border-white/20 shadow-premium">
        <CardHeader className="text-center">
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-heading font-bold">
            {steps[currentStep].title}
          </CardTitle>
          <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
        </CardHeader>

        <CardContent className="space-y-8">
          {renderCurrentStep()}

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="border-2 border-muted hover:border-primary/50"
            >
              Previous
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-primary hover:shadow-glow transition-spring group"
            >
              {currentStep === steps.length - 1 ? "Start Journey" : "Continue"}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartOnboarding;