import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Building,
  MapPin,
  Target,
  Leaf,
  Zap,
  Car,
  Utensils,
  Trash2,
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface OnboardingWizardProps {
  onComplete: (userData: any) => void;
  onSkip: () => void;
}

const OnboardingWizard = ({ onComplete, onSkip }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    accountType: "",
    profile: {
      name: "",
      email: "",
      location: "",
      organization: ""
    },
    goals: {
      carbonReduction: 25,
      challengesPerMonth: 2,
      focusAreas: [] as string[]
    },
    interests: [] as string[],
    experience: "",
    notifications: {
      email: true,
      push: true,
      weekly: true
    }
  });

  const totalSteps = 6;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const accountTypes = [
    {
      id: "citizen",
      title: "Individual",
      description: "Personal sustainability journey",
      icon: User,
      benefits: ["Personal tracking", "Community challenges", "Achievement system"]
    },
    {
      id: "business", 
      title: "Business",
      description: "Employee sustainability programs",
      icon: Building,
      benefits: ["Team challenges", "Analytics dashboard", "ROI tracking"]
    },
    {
      id: "government",
      title: "Government",
      description: "Public sector initiatives",
      icon: MapPin,
      benefits: ["Policy tracking", "Community programs", "Impact measurement"]
    },
    {
      id: "ngo",
      title: "NGO/Nonprofit",
      description: "Organization-wide programs",
      icon: Users,
      benefits: ["Volunteer coordination", "Campaign management", "Impact reporting"]
    }
  ];

  const focusAreas = [
    { id: "energy", title: "Energy Conservation", icon: Zap, color: "bg-yellow-500" },
    { id: "transport", title: "Sustainable Transport", icon: Car, color: "bg-blue-500" },
    { id: "food", title: "Sustainable Food", icon: Utensils, color: "bg-green-500" },
    { id: "waste", title: "Waste Reduction", icon: Trash2, color: "bg-purple-500" },
    { id: "community", title: "Community Action", icon: Users, color: "bg-pink-500" }
  ];

  const interests = [
    "Climate Science", "Renewable Energy", "Sustainable Fashion", "Zero Waste",
    "Organic Farming", "Green Building", "Conservation", "Environmental Policy",
    "Circular Economy", "Carbon Footprint", "Biodiversity", "Clean Technology"
  ];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast.success("Welcome to your sustainability journey!");
    onComplete(userData);
  };

  const updateProfile = (field: string, value: any) => {
    setUserData(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const updateGoals = (field: string, value: any) => {
    setUserData(prev => ({
      ...prev,
      goals: { ...prev.goals, [field]: value }
    }));
  };

  const toggleFocusArea = (area: string) => {
    const current = userData.goals.focusAreas;
    const updated = current.includes(area)
      ? current.filter(a => a !== area)
      : [...current, area];
    updateGoals("focusAreas", updated);
  };

  const toggleInterest = (interest: string) => {
    const current = userData.interests;
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest];
    setUserData(prev => ({ ...prev, interests: updated }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return userData.accountType !== "";
      case 1:
        return userData.profile.name && userData.profile.email;
      case 2:
        return userData.goals.focusAreas.length > 0;
      case 3:
        return userData.experience !== "";
      case 4:
        return true; // Interests are optional
      case 5:
        return true; // Notifications have defaults
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Welcome to SustainHub!</h2>
              <p className="text-muted-foreground">Let's get you set up for success</p>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Choose your account type:</Label>
              <div className="grid md:grid-cols-2 gap-4">
                {accountTypes.map((type) => (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      userData.accountType === type.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setUserData(prev => ({ ...prev, accountType: type.id }))}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <type.icon className="w-8 h-8 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{type.title}</CardTitle>
                          <CardDescription>{type.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {type.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-3 h-3 text-success" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
              <p className="text-muted-foreground">Basic information to personalize your experience</p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={userData.profile.name}
                  onChange={(e) => updateProfile("name", e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.profile.email}
                  onChange={(e) => updateProfile("email", e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={userData.profile.location}
                  onChange={(e) => updateProfile("location", e.target.value)}
                  placeholder="City, Country"
                />
              </div>

              {userData.accountType !== "citizen" && (
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={userData.profile.organization}
                    onChange={(e) => updateProfile("organization", e.target.value)}
                    placeholder="Company/Organization name"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Choose your focus areas</h2>
              <p className="text-muted-foreground">Select the sustainability areas you'd like to work on</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {focusAreas.map((area) => (
                <Card
                  key={area.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    userData.goals.focusAreas.includes(area.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => toggleFocusArea(area.id)}
                >
                  <CardContent className="p-6 text-center">
                    <area.icon className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h3 className="font-medium mb-2">{area.title}</h3>
                    {userData.goals.focusAreas.includes(area.id) && (
                      <CheckCircle className="w-5 h-5 text-success mx-auto" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <Label>Carbon Reduction Goal (% per year)</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={userData.goals.carbonReduction}
                    onChange={(e) => updateGoals("carbonReduction", parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant="secondary">{userData.goals.carbonReduction}%</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Challenges per month</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={userData.goals.challengesPerMonth}
                    onChange={(e) => updateGoals("challengesPerMonth", parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant="secondary">{userData.goals.challengesPerMonth}</Badge>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Leaf className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your sustainability experience</h2>
              <p className="text-muted-foreground">Help us tailor content to your level</p>
            </div>

            <RadioGroup 
              value={userData.experience}
              onValueChange={(value) => setUserData(prev => ({ ...prev, experience: value }))}
              className="space-y-4 max-w-md mx-auto"
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Beginner</p>
                    <p className="text-sm text-muted-foreground">New to sustainability practices</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Intermediate</p>
                    <p className="text-sm text-muted-foreground">Some experience with eco-friendly habits</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Advanced</p>
                    <p className="text-sm text-muted-foreground">Experienced in sustainability practices</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="expert" id="expert" />
                <Label htmlFor="expert" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Expert</p>
                    <p className="text-sm text-muted-foreground">Professional or deep expertise in sustainability</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">What interests you?</h2>
              <p className="text-muted-foreground">Optional: Select topics you'd like to learn more about</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {interests.map((interest) => (
                <Badge
                  key={interest}
                  variant={userData.interests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer p-3 text-center justify-center hover:bg-primary/10 transition-colors"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
              <p className="text-muted-foreground">Choose how you'd like to stay updated</p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="font-medium">Email Updates</Label>
                  <p className="text-sm text-muted-foreground">Progress reports and important announcements</p>
                </div>
                <Checkbox
                  checked={userData.notifications.email}
                  onCheckedChange={(checked) => 
                    setUserData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: !!checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Challenge reminders and achievements</p>
                </div>
                <Checkbox
                  checked={userData.notifications.push}
                  onCheckedChange={(checked) => 
                    setUserData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: !!checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="font-medium">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Summary of your weekly progress</p>
                </div>
                <Checkbox
                  checked={userData.notifications.weekly}
                  onCheckedChange={(checked) => 
                    setUserData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, weekly: !!checked }
                    }))
                  }
                />
              </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg text-center max-w-md mx-auto">
              <h3 className="font-semibold mb-2">Ready to start your journey!</h3>
              <p className="text-sm text-muted-foreground">
                You'll be taken to your personalized dashboard where you can start taking action.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {totalSteps}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip Setup
            </Button>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent>
          {renderStep()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {currentStep === totalSteps - 1 ? "Complete Setup" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard;