import { Outlet } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import FeedbackButton from "@/components/feedback/FeedbackButton";
import PWAInstallBanner from "@/components/pwa/PWAInstallBanner";

export default function AppLayout() {
  const { isDemoMode } = useAuth();
  
  return (
    <div className="min-h-screen bg-white">
      <header>
        <Navigation />
      </header>
      {/* Nav is fixed (h-16). In demo mode there's an extra 8px banner above it. */}
      {/* Add bottom padding on mobile for the bottom nav (h-16) */}
      <main className={`${isDemoMode ? "pt-24" : "pt-16"} pb-16 md:pb-0`}>
        <Outlet />
      </main>
      
      {/* Footer - visible on all screen sizes (legal links required by GDPR) */}
      <Footer />
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
      
      {/* PWA Install Banner - mobile only */}
      <PWAInstallBanner />
      
      {/* Feedback Button - appears on all pages for pilot testing */}
      <FeedbackButton />
    </div>
  );
}
