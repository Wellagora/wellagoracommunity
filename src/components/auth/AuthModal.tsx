import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

const AuthModal = ({ isOpen, onClose, initialMode = "register" }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode);
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleSuccess = () => {
    onClose();
    
    // Redirect based on user role
    const userRole = profile?.user_role;
    
    if (userRole === 'business' || userRole === 'government' || userRole === 'ngo') {
      navigate('/organization');
    } else {
      // Default to dashboard for citizens and unknown roles
      navigate('/dashboard');
    }
  };

  // Also check for super_admin role via user_roles table
  useEffect(() => {
    if (profile?.id) {
      // The profile.user_role only covers citizen/business/government/ngo
      // For super_admin redirect, we'd need to check user_roles table
      // But for simplicity, super_admins can navigate manually from dashboard
    }
  }, [profile]);

  const renderContent = () => {
    switch (mode) {
      case "register":
        return (
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setMode("login")}
          />
        );
      case "login":
        return (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={() => setMode("register")}
            onForgotPassword={() => setMode("forgot")}
          />
        );
      case "forgot":
        return (
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-4">Password Reset</h3>
            <p className="text-muted-foreground mb-4">
              Password reset functionality will be available once Supabase is connected.
            </p>
            <button
              onClick={() => setMode("login")}
              className="text-primary hover:underline"
            >
              Back to Login
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Sign in or create an account to access Wellagora
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
