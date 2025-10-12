import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import DynamicRegionalDashboard from "@/pages/DynamicRegionalDashboard";
import Community from "@/pages/Community";
import AIAssistantPage from "@/pages/AIAssistantPage";
import ChallengesPage from "@/pages/ChallengesPage";
import ChallengeDetailPage from "@/pages/ChallengeDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import OrganizationDashboard from "@/pages/OrganizationDashboard";
import MatchingPage from "@/pages/MatchingPage";
import BusinessSponsorshipPage from "@/pages/BusinessSponsorshipPage";
import InteractiveMapPage from "@/pages/InteractiveMapPage";
import HandprintPage from "@/pages/HandprintPage";
import PublicOrganizationPage from "@/pages/PublicOrganizationPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import HandprintCalculatorPage from "@/pages/HandprintCalculatorPage";
import "./index.css";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <LanguageProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard/handprint" element={<HandprintPage />} />
              <Route path="/dashboard/handprint-calculator" element={<HandprintCalculatorPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/dynamic-regional" element={<DynamicRegionalDashboard />} />
              <Route path="/community" element={<Community />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/challenges/:challengeId" element={<ChallengeDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/organization" element={<OrganizationDashboard />} />
              <Route path="/organization/:organizationId" element={<PublicOrganizationPage />} />
              <Route path="/matching" element={<MatchingPage />} />
              <Route path="/business-sponsorship" element={<BusinessSponsorshipPage />} />
              <Route path="/interactive-map" element={<InteractiveMapPage />} />
            </Routes>
            <Toaster />
            <SonnerToaster />
          </BrowserRouter>
          </LanguageProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;