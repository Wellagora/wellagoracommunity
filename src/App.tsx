import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { initSentry } from "@/lib/sentry";
import RegionalHub from './pages/RegionalHub';
import ExploreRegionPage from './pages/ExploreRegionPage';
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import CommunityPage from "@/pages/CommunityPage";
import AIAssistantPage from "@/pages/AIAssistantPage";
import ChallengesPage from "@/pages/ChallengesPage";
import ChallengeDetailPage from "@/pages/ChallengeDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import OrganizationDashboard from "@/pages/OrganizationDashboard";
import HandprintPage from "@/pages/HandprintPage";
import PublicOrganizationPage from "@/pages/PublicOrganizationPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import HandprintCalculatorPage from "@/pages/HandprintCalculatorPage";
import SponsorDashboardPage from "@/pages/SponsorDashboardPage";
import ProjectAdminPage from "@/pages/ProjectAdminPage";
import JoinProjectPage from "@/pages/JoinProjectPage";
import ProjectsListPage from "@/pages/ProjectsListPage";
import BrowseProgramsPage from "@/pages/BrowseProgramsPage";
import ContactPage from "@/pages/ContactPage";
import InboxPage from "@/pages/InboxPage";
import TranslationToolPage from "@/pages/TranslationToolPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import ImpressumPage from "@/pages/ImpressumPage";
import NotFound from "@/pages/NotFound";
import "./index.css";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  });

  // Initialize Sentry after React is ready
  useEffect(() => {
    initSentry();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <LanguageProvider>
            <ProjectProvider>
              <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard/handprint" element={<HandprintPage />} />
                <Route path="/dashboard/handprint-calculator" element={<HandprintCalculatorPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                <Route path="/regional-hub" element={<Navigate to="/community" replace />} />
                <Route path="/explore-region" element={<ExploreRegionPage />} />
                <Route path="/interactive-map" element={<Navigate to="/community" replace />} />
                <Route path="/matching" element={<Navigate to="/community" replace />} />
                <Route path="/dynamic-regional" element={<Navigate to="/community" replace />} />
                <Route path="/revolutionary" element={<Navigate to="/community" replace />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/ai-assistant" element={<AIAssistantPage />} />
                <Route path="/challenges" element={<ChallengesPage />} />
                <Route path="/challenges/:challengeId" element={<ChallengeDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/organization" element={<OrganizationDashboard />} />
                <Route path="/organization/:organizationId" element={<PublicOrganizationPage />} />
                <Route path="/sponsor-dashboard" element={<SponsorDashboardPage />} />
                <Route path="/browse-programs" element={<BrowseProgramsPage />} />
                <Route path="/project-admin" element={<ProjectAdminPage />} />
                <Route path="/projects" element={<ProjectsListPage />} />
                <Route path="/join/:projectSlug" element={<JoinProjectPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/inbox" element={<InboxPage />} />
                <Route path="/translation-tool" element={<TranslationToolPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/impressum" element={<ImpressumPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <SonnerToaster />
              </BrowserRouter>
            </ProjectProvider>
          </LanguageProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;