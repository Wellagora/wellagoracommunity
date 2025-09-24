import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

const AuthModal = ({ isOpen, onClose, initialMode = "register" }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode);

  const handleSuccess = () => {
    onClose();
    // TODO: Redirect to dashboard or refresh user state
  };

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