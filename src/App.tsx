import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ViewModeProvider } from "@/contexts/ViewModeContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { initSentry } from "@/lib/sentry";
import { LoadingFallback } from "@/components/LoadingFallback";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import "./index.css";

// Lazy load all pages for better performance
const RegionalHub = lazy(() => import("./pages/RegionalHub"));
const ExploreRegionPage = lazy(() => import("./pages/ExploreRegionPage"));
const Index = lazy(() => import("@/pages/Index"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const CommunityPage = lazy(() => import("@/pages/CommunityPage"));
const AIAssistantPage = lazy(() => import("@/pages/AIAssistantPage"));
const ChallengesPage = lazy(() => import("@/pages/ChallengesPage"));
const ChallengeDetailPage = lazy(() => import("@/pages/ChallengeDetailPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const OrganizationDashboard = lazy(() => import("@/pages/OrganizationDashboard"));
const HandprintPage = lazy(() => import("@/pages/HandprintPage"));
const PublicOrganizationPage = lazy(() => import("@/pages/PublicOrganizationPage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const HandprintCalculatorPage = lazy(() => import("@/pages/HandprintCalculatorPage"));
const SponsorDashboardPage = lazy(() => import("@/pages/SponsorDashboardPage"));
const ProjectAdminPage = lazy(() => import("@/pages/ProjectAdminPage"));
const JoinProjectPage = lazy(() => import("@/pages/JoinProjectPage"));
const ProjectsListPage = lazy(() => import("@/pages/ProjectsListPage"));
const BrowseProgramsPage = lazy(() => import("@/pages/BrowseProgramsPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const InboxPage = lazy(() => import("@/pages/InboxPage"));
const TranslationToolPage = lazy(() => import("@/pages/TranslationToolPage"));
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"));
const ImpressumPage = lazy(() => import("@/pages/ImpressumPage"));
const SuperAdminPage = lazy(() => import("@/pages/SuperAdminPage"));
const SponsorLandingPage = lazy(() => import("@/pages/SponsorLandingPage"));
const OrganizationRegisterPage = lazy(() => import("@/pages/OrganizationRegisterPage"));
const JoinOrganizationPage = lazy(() => import("@/pages/JoinOrganizationPage"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

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
    <ErrorBoundary>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ViewModeProvider>
              <SubscriptionProvider>
                <ProjectProvider>
                  <BrowserRouter>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        {/* Auth page intentionally without global nav */}
                        <Route path="/auth" element={<AuthPage />} />

                        {/* All other pages share a single, top-level navigation layout */}
                        <Route element={<AppLayout />}>
                          <Route path="/" element={<Index />} />
                          <Route path="/dashboard/handprint" element={<HandprintPage />} />
                          <Route path="/dashboard/handprint-calculator" element={<HandprintCalculatorPage />} />
                          <Route path="/dashboard" element={<DashboardPage />} />
                          <Route
                            path="/admin"
                            element={
                              <ProtectedRoute requireAdmin>
                                <AdminDashboardPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin-dashboard"
                            element={
                              <ProtectedRoute requireAdmin>
                                <AdminDashboardPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/regional-hub" element={<Navigate to="/community" replace />} />
                          <Route path="/explore-region" element={<ExploreRegionPage />} />
                          <Route path="/interactive-map" element={<Navigate to="/community" replace />} />
                          <Route path="/matching" element={<Navigate to="/community" replace />} />
                          <Route path="/dynamic-regional" element={<Navigate to="/community" replace />} />
                          <Route path="/revolutionary" element={<Navigate to="/community" replace />} />
                          <Route path="/community" element={<CommunityPage />} />
                          <Route path="/ai-assistant" element={<AIAssistantPage />} />
                          <Route path="/events" element={<EventsPage />} />
                          <Route path="/challenges" element={<ChallengesPage />} />
                          <Route path="/challenges/:challengeId" element={<ChallengeDetailPage />} />
                          <Route
                            path="/profile"
                            element={
                              <ProtectedRoute>
                                <ProfilePage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/profile/:userId" element={<ProfilePage />} />
                          <Route
                            path="/organization"
                            element={
                              <ProtectedRoute allowedRoles={["business", "government", "ngo"]}>
                                <OrganizationDashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/organization/:organizationId" element={<PublicOrganizationPage />} />
                          <Route
                            path="/sponsor-dashboard"
                            element={
                              <ProtectedRoute allowedRoles={["business", "government", "ngo"]}>
                                <SponsorDashboardPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/browse-programs" element={<BrowseProgramsPage />} />
                          <Route
                            path="/project-admin/:projectId"
                            element={
                              <ProtectedRoute requireAdmin>
                                <ProjectAdminPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/projects" element={<ProjectsListPage />} />
                          <Route path="/join/:projectSlug" element={<JoinProjectPage />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route
                            path="/inbox"
                            element={
                              <ProtectedRoute>
                                <InboxPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/translation-tool"
                            element={
                              <ProtectedRoute requireAdmin>
                                <TranslationToolPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                          <Route path="/impressum" element={<ImpressumPage />} />
                          <Route
                            path="/super-admin"
                            element={
                              <ProtectedRoute requireSuperAdmin>
                                <SuperAdminPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/sponsor" element={<SponsorLandingPage />} />
                          <Route path="/register/organization" element={<OrganizationRegisterPage />} />
                          <Route path="/join/org/:inviteCode" element={<JoinOrganizationPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Route>
                      </Routes>
                    </Suspense>
                    <Toaster />
                    <SonnerToaster />
                  </BrowserRouter>
                </ProjectProvider>
              </SubscriptionProvider>
            </ViewModeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
