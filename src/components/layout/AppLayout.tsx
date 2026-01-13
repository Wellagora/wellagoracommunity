import { Outlet } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import FeedbackButton from "@/components/feedback/FeedbackButton";

export default function AppLayout() {
  const { isDemoMode } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <header>
        <Navigation />
      </header>
      <main className={`${isDemoMode ? 'pt-20 md:pt-22' : 'pt-12 md:pt-14'}`}>
        <Outlet />
      </main>
      
      {/* Feedback Button - appears on all pages for pilot testing */}
      <FeedbackButton />
    </div>
  );
}
