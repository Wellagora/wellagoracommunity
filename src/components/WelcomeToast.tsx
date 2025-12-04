import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  Sparkles, 
  Users, 
  Leaf, 
  X,
  Gift
} from "lucide-react";

const WelcomeToast = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Show welcome message after a short delay
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    setShowWelcome(false);
    toast({
      title: "🎉 Welcome to the community!",
      description: "Let's start your sustainability journey together",
    });
  };

  const handleDismiss = () => {
    setShowWelcome(false);
  };

  if (!showWelcome) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] animate-slide-in-right">
      <Card className="w-96 bg-glass backdrop-blur-xl border-2 border-primary/30 shadow-premium hover:shadow-glow transition-spring">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-primary/30">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" />
                  <AvatarFallback>WC</AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground flex items-center">
                  Welcome Champion! 
                  <Sparkles className="w-4 h-4 ml-2 text-warning animate-pulse" />
                </h3>
                <p className="text-sm text-muted-foreground">Sarah from Wellagora</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="h-8 w-8 p-0 hover:bg-destructive/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-primary/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">You're in great company!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Join <strong>50,000+ sustainability champions</strong> already making a difference in their communities.
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">234 people online now</span>
              </div>
              <Badge className="bg-success/10 text-success border-success/20">
                <Leaf className="w-3 h-3 mr-1" />
                Active Community
              </Badge>
            </div>

            <div className="bg-warning/10 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium text-foreground">
                  🎁 New member bonus: <strong>100 points</strong> to start!
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleGetStarted}
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-spring"
              >
                Let's Begin!
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDismiss}
                className="border-2 border-muted hover:border-primary/50"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeToast;