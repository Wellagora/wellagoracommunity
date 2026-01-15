import { Outlet } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import FeedbackButton from "@/components/feedback/FeedbackButton";

export default function AppLayout() {
  const { isDemoMode } = useAuth();
  
  return (
    <div className="min-h-screen bg-white">
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
