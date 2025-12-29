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
const SponsorDashboardPage = lazy(() => import("@/pages/SupporterDashboardPage"));
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
const CreatorDashboardPage = lazy(() => import("@/pages/CreatorDashboardPage"));
const CreatorProgramNewPage = lazy(() => import("@/pages/CreatorProgramNewPage"));
const CreatorProgramEditPage = lazy(() => import("@/pages/CreatorProgramEditPage"));
const WorkshopSecretWizard = lazy(() => import("@/components/wizard/WorkshopSecretWizard"));
const WorkshopSecretViewPage = lazy(() => import("@/pages/WorkshopSecretViewPage"));
const ControlPanelPage = lazy(() => import("@/pages/ControlPanelPage"));
const ProgramDetailPage = lazy(() => import("@/pages/ProgramDetailPage"));
const ProgramLearnPage = lazy(() => import("@/pages/ProgramLearnPage"));
const MyLearningPage = lazy(() => import("@/pages/MyLearningPage"));
const CreatorPublicProfilePage = lazy(() => import("@/pages/CreatorPublicProfilePage"));
const ProgramsListingPage = lazy(() => import("@/pages/ProgramsListingPage"));
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
                          <Route path="/dashboard" element={<Navigate to="/iranyitopult" replace />} />
                          
                          {/* Control Panel (Irányítópult) - new primary dashboard route */}
                          <Route
                            path="/iranyitopult"
                            element={
                              <ProtectedRoute>
                                <ControlPanelPage />
                              </ProtectedRoute>
                            }
                          />
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
                          <Route path="/events" element={<Navigate to="/esemenyek" replace />} />
                          <Route path="/elo-alkalmak" element={<Navigate to="/esemenyek" replace />} />
                          <Route path="/esemenyek" element={<EventsPage />} />
                          
                          {/* Redirect challenges to marketplace */}
                          <Route path="/challenges" element={<Navigate to="/piacer" replace />} />
                          <Route path="/challenges/:challengeId" element={<Navigate to="/piacer" replace />} />
                          
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
                          {/* Támogató Panel - Supporter Dashboard */}
                          <Route
                            path="/tamogato-panel"
                            element={
                              <ProtectedRoute allowedRoles={["business", "government", "ngo"]}>
                                <SponsorDashboardPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/sponsor-dashboard"
                            element={<Navigate to="/tamogato-panel" replace />}
                          />
                          <Route
                            path="/business-dashboard"
                            element={<Navigate to="/tamogato-panel" replace />}
                          />
                          <Route path="/browse-programs" element={<Navigate to="/piacer" replace />} />
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
                          
                          {/* Expert Studio (Szakértői Stúdió) - new Hungarian routes */}
                          <Route
                            path="/szakertoi-studio"
                            element={
                              <ProtectedRoute allowedRoles={["creator"]}>
                                <CreatorDashboardPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/szakertoi-studio/uj"
                            element={
                              <ProtectedRoute allowedRoles={["creator"]}>
                                <WorkshopSecretWizard />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/szakertoi-studio/:id/szerkesztes"
                            element={
                              <ProtectedRoute allowedRoles={["creator"]}>
                                <WorkshopSecretWizard />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/szakertoi-studio/uj-utmutato"
                            element={<Navigate to="/szakertoi-studio/uj" replace />}
                          />
                          
                          {/* Redirects from old creator routes */}
                          <Route path="/creator/dashboard" element={<Navigate to="/szakertoi-studio" replace />} />
                          <Route path="/creator/programs/new" element={<Navigate to="/szakertoi-studio/uj-utmutato" replace />} />
                          <Route path="/creator/programs/:id/edit" element={<Navigate to="/szakertoi-studio/utmutato/:id" replace />} />
                          
                          {/* Marketplace (Piactér) - new Hungarian routes */}
                          <Route path="/piacer" element={<ProgramsListingPage />} />
                          <Route path="/piacer/:id" element={<ProgramDetailPage />} />
                          
                          {/* Workshop Secret View (Műhelytitok nézet) */}
                          <Route
                            path="/muhelytitok/:id"
                            element={
                              <ProtectedRoute>
                                <WorkshopSecretViewPage />
                              </ProtectedRoute>
                            }
                          />
                          
                          <Route path="/programs/:id" element={<ProgramDetailPage />} />
                          <Route path="/programs" element={<Navigate to="/piacer" replace />} />
                          <Route path="/piactr" element={<Navigate to="/piacer" replace />} />
                          
                          <Route
                            path="/piacer/:id/learn"
                            element={
                              <ProtectedRoute>
                                <ProgramLearnPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/programs/:id/learn"
                            element={
                              <ProtectedRoute>
                                <ProgramLearnPage />
                              </ProtectedRoute>
                            }
                          />
                          
                          {/* My Learning - redirects to control panel */}
                          <Route path="/en-agoram" element={<Navigate to="/iranyitopult" replace />} />
                          <Route path="/my-learning" element={<Navigate to="/iranyitopult" replace />} />
                          
                          {/* Expert profiles (Szakértők) */}
                          <Route path="/szakertok/:id" element={<CreatorPublicProfilePage />} />
                          <Route path="/creators/:id" element={<CreatorPublicProfilePage />} />
                          
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
