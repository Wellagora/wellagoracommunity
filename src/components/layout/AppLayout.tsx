import { Outlet, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import FeedbackButton from "@/components/feedback/FeedbackButton";
import LiquidMeshGradient from "@/components/ui/LiquidMeshGradient";

export default function AppLayout() {
  const { isDemoMode } = useAuth();
  const location = useLocation();
  
  // Landing page gets vibrant background, all internal pages get muted
  const isLandingPage = location.pathname === "/" || location.pathname === "";
  const gradientIntensity = isLandingPage ? 'vibrant' : 'muted';
  
  return (
    <div className="min-h-screen bg-transparent">
      {/* Global Liquid Mesh Gradient - runs behind everything */}
      <LiquidMeshGradient intensity={gradientIntensity} />
      
      <header>
        <Navigation />
      </header>
      {/* Nav is fixed (h-16). In demo mode there's an extra 8px banner above it. */}
      <main className={isDemoMode ? "pt-24" : "pt-16"}>
        <Outlet />
      </main>
      
      {/* Feedback Button - appears on all pages for pilot testing */}
      <FeedbackButton />
    </div>
  );
}
