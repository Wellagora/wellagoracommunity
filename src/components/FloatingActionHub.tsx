import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  MessageCircle, 
  Target, 
  Users,
  Sparkles,
  Camera,
  Lightbulb,
  X
} from "lucide-react";

const FloatingActionHub = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const actions = [
    {
      icon: Target,
      label: "Start Challenge",
      color: "bg-primary hover:bg-primary-dark",
      description: "Begin a new sustainability challenge",
      action: () => navigate('/challenges')
    },
    {
      icon: MessageCircle,
      label: "Ask AI",
      color: "bg-accent hover:bg-accent-light",
      description: "Get instant sustainability advice",
      action: () => navigate('/ai-assistant')
    },
    {
      icon: Users,
      label: "Find Friends",
      color: "bg-success hover:bg-success-light",
      description: "Connect with local champions",
      action: () => navigate('/community')
    },
    {
      icon: Camera,
      label: "Share Progress",
      color: "bg-warning hover:bg-warning/80",
      description: "Show off your achievements",
      action: () => navigate('/dashboard')
    },
    {
      icon: Lightbulb,
      label: "Get Ideas",
      color: "bg-purple-500 hover:bg-purple-600",
      description: "Discover new eco-friendly tips",
      action: () => navigate('/browse-programs')
    }
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    action.action();
    setIsExpanded(false);
    toast({
      title: action.label,
      description: action.description,
    });
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Action Buttons */}
      {isExpanded && (
        <div className="absolute bottom-20 right-0 space-y-3 animate-slide-up">
          {actions.map((action, index) => (
            <div
              key={action.label}
              className="flex items-center space-x-3 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Badge className="bg-glass backdrop-blur-md border-white/20 text-foreground px-3 py-1 text-sm whitespace-nowrap">
                {action.description}
              </Badge>
              <Button
                onClick={() => handleActionClick(action)}
                className={`w-12 h-12 rounded-full shadow-premium hover:shadow-glow transition-spring hover:scale-110 ${action.color}`}
              >
                <action.icon className="w-5 h-5 text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-16 h-16 rounded-full shadow-premium hover:shadow-glow transition-spring hover:scale-110 ${
          isExpanded 
            ? 'bg-destructive hover:bg-destructive/80 rotate-45' 
            : 'bg-gradient-primary hover:bg-primary-dark'
        }`}
      >
        {isExpanded ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <Plus className="w-6 h-6 text-white" />
            <Sparkles className="w-3 h-3 text-white/80 absolute -top-1 -right-1 animate-pulse" />
          </div>
        )}
      </Button>

      {/* Pulse Ring */}
      {!isExpanded && (
        <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping"></div>
      )}

      {/* Notification Dot */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white flex items-center justify-center">
        <span className="text-xs font-bold text-white">3</span>
      </div>
    </div>
  );
};

export default FloatingActionHub;