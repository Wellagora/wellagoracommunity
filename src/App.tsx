import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ViewModeProvider } from "@/contexts/ViewModeContext";
import { RegionProvider } from "@/contexts/RegionContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { initSentry } from "@/lib/sentry";
import { LoadingFallback } from "@/components/LoadingFallback";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import TermsCheckWrapper from "@/components/wrappers/TermsCheckWrapper";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import "./index.css";

// Lazy load all pages for better performance
const RegionalHub = lazy(() => import("./pages/RegionalHub"));
const ExploreRegionPage = lazy(() => import("./pages/ExploreRegionPage"));
const Index = lazy(() => import("@/pages/Index"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const MyHubPage = lazy(() => import("@/pages/MyHubPage"));
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
const MemberDashboard = lazy(() => import("@/pages/MemberDashboard"));
const ExpertStudio = lazy(() => import("@/pages/ExpertStudio"));
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
const AdminLayout = lazy(() => import("@/layouts/AdminLayout"));
const AdminDashboardNew = lazy(() => import("@/pages/admin/AdminDashboardNew"));
const AdminPlaceholder = lazy(() => import("@/pages/admin/AdminPlaceholder"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminExperts = lazy(() => import("@/pages/admin/AdminExperts"));
const AdminProjects = lazy(() => import("@/pages/admin/AdminProjects"));
const AdminSponsors = lazy(() => import("@/pages/admin/AdminSponsors"));
const AdminPrograms = lazy(() => import("@/pages/admin/AdminPrograms"));
const AdminEvents = lazy(() => import("@/pages/admin/AdminEvents"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminFeedback = lazy(() => import("@/pages/admin/AdminFeedback"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminFinancials = lazy(() => import("@/pages/admin/AdminFinancials"));
const AdminAudit = lazy(() => import("@/pages/admin/AdminAudit"));
const AdminProjectHub = lazy(() => import("@/pages/admin/AdminProjectHub"));
const SponsorLandingPage = lazy(() => import("@/pages/SponsorLandingPage"));
const SponsorOnboardingPage = lazy(() => import("@/pages/SponsorOnboardingPage"));
const SponsorPublicProfilePage = lazy(() => import("@/pages/SponsorPublicProfilePage"));
const OrganizationRegisterPage = lazy(() => import("@/pages/OrganizationRegisterPage"));
const JoinOrganizationPage = lazy(() => import("@/pages/JoinOrganizationPage"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const CreatorDashboardPage = lazy(() => import("@/pages/CreatorDashboardPage"));
const CreatorProgramNewPage = lazy(() => import("@/pages/CreatorProgramNewPage"));
const CreatorProgramEditPage = lazy(() => import("@/pages/CreatorProgramEditPage"));
const WorkshopSecretWizard = lazy(() => import("@/components/wizard/WorkshopSecretWizard"));
const ProgramCreatorWizard = lazy(() => import("@/components/expert-studio/ProgramCreatorWizard"));
const WorkshopSecretViewPage = lazy(() => import("@/pages/WorkshopSecretViewPage"));
const ControlPanelPage = lazy(() => import("@/pages/ControlPanelPage"));
const ProgramDetailPage = lazy(() => import("@/pages/ProgramDetailPage"));
const ProgramLearnPage = lazy(() => import("@/pages/ProgramLearnPage"));
const MyLearningPage = lazy(() => import("@/pages/MyLearningPage"));
const CreatorPublicProfilePage = lazy(() => import("@/pages/CreatorPublicProfilePage"));
const ProgramsListingPage = lazy(() => import("@/pages/ProgramsListingPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const MyCoursesPage = lazy(() => import("@/pages/MyCoursesPage"));
const PartnersPage = lazy(() => import("@/pages/PartnersPage"));
const PartnerProfilePage = lazy(() => import("@/pages/PartnerProfilePage"));
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage"));
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
                  <RegionProvider>
                    <BrowserRouter>
                      {/* Analytics Tracker - must be inside Router & AuthProvider */}
                      <AnalyticsTracker />
                      <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                          {/* Auth page intentionally without global nav */}
                          <Route path="/auth" element={<AuthPage />} />

                        {/* All other pages share a single, top-level navigation layout */}
                        {/* TermsCheckWrapper shows Terms modal for real users who haven't accepted */}
                        <Route element={<TermsCheckWrapper />}>
                          <Route element={<AppLayout />}>
                            <Route path="/" element={<Index />} />
                          <Route path="/dashboard/handprint" element={<HandprintPage />} />
                          <Route path="/dashboard/handprint-calculator" element={<HandprintCalculatorPage />} />
                          {/* Member routes - redirect legacy paths to /programs */}
                          <Route path="/dashboard" element={<Navigate to="/programs" replace />} />
                          <Route path="/iranyitopult" element={<Navigate to="/programs" replace />} />
                          <Route path="/sajat-kozpont" element={<Navigate to="/programs" replace />} />
                          {/* Admin routes redirect to admin-panel for super admins */}
                          <Route path="/admin" element={<Navigate to="/admin-panel" replace />} />
                          <Route path="/admin-dashboard" element={<Navigate to="/admin-panel" replace />} />
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
                          
                          {/* Partner routes */}
                          <Route path="/partners" element={<PartnersPage />} />
                          <Route path="/partners/:slug" element={<PartnerProfilePage />} />
                          
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
                              <ProtectedRoute allowedRoles={["sponsor"]}>
                                <OrganizationDashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/organization/:organizationId" element={<PublicOrganizationPage />} />
                          {/* Sponsor Dashboard - English canonical path */}
                          <Route
                            path="/sponsor-dashboard"
                            element={
                              <ProtectedRoute allowedRoles={["sponsor"]}>
                                <SponsorDashboardPage />
                              </ProtectedRoute>
                            }
                          />
                          {/* Sponsor Dashboard - Hungarian legacy routes (redirect to English) */}
                          <Route path="/tamogato-panel" element={<Navigate to="/sponsor-dashboard" replace />} />
                          <Route path="/tamogatoi-kozpont" element={<Navigate to="/sponsor-dashboard" replace />} />
                          <Route path="/business-dashboard" element={<Navigate to="/sponsor-dashboard" replace />} />
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
                          
                          {/* Sponsor routes */}
                          <Route path="/sponsor" element={<SponsorLandingPage />} />
                          <Route path="/register/organization" element={<OrganizationRegisterPage />} />
                          <Route path="/join/org/:inviteCode" element={<JoinOrganizationPage />} />
                          <Route
                            path="/sponsor-onboarding"
                            element={
                              <ProtectedRoute allowedRoles={["sponsor"]}>
                                <SponsorOnboardingPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/sponsor/:sponsorId" element={<SponsorPublicProfilePage />} />
                          
                          {/* Expert Studio - English canonical path */}
                          <Route
                            path="/expert-studio"
                            element={
                              <ProtectedRoute allowedRoles={["expert"]}>
                                <ExpertStudio />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/expert-studio/new"
                            element={
                              <ProtectedRoute allowedRoles={["expert"]}>
                                <ProgramCreatorWizard />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/expert-studio/:id/edit"
                            element={
                              <ProtectedRoute allowedRoles={["expert"]}>
                                <ProgramCreatorWizard />
                              </ProtectedRoute>
                            }
                          />
                          
                          {/* Expert Studio - Hungarian legacy routes (redirect to English) */}
                          <Route path="/szakertoi-studio" element={<Navigate to="/expert-studio" replace />} />
                          <Route path="/szakertoi-studio/uj" element={<Navigate to="/expert-studio/new" replace />} />
                          <Route path="/szakertoi-studio/:id/szerkesztes" element={<Navigate to="/expert-studio/:id/edit" replace />} />
                          <Route path="/szakertoi-studio/uj-utmutato" element={<Navigate to="/expert-studio/new" replace />} />
                          
                          {/* Redirects from old creator routes */}
                          <Route path="/creator/dashboard" element={<Navigate to="/expert-studio" replace />} />
                          <Route path="/creator/programs/new" element={<Navigate to="/expert-studio/new" replace />} />
                          <Route path="/creator/programs/:id/edit" element={<Navigate to="/expert-studio/:id/edit" replace />} />
                          
                          {/* Marketplace (Piactér) - new Hungarian routes */}
                          <Route path="/piacer" element={<ProgramsListingPage />} />
                          <Route path="/piacer/:id" element={<ProgramDetailPage />} />
                          
                          {/* Mobile Navigation Routes */}
                          <Route
                            path="/kurzusaim"
                            element={
                              <ProtectedRoute>
                                <MyCoursesPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/ertesitesek"
                            element={
                              <ProtectedRoute>
                                <NotificationsPage />
                              </ProtectedRoute>
                            }
                          />
                          
                          {/* Favorites page for members */}
                          <Route
                            path="/favorites"
                            element={
                              <ProtectedRoute>
                                <FavoritesPage />
                              </ProtectedRoute>
                            }
                          />
                          
                          {/* My Center / My Hub for members */}
                          <Route
                            path="/my-center"
                            element={
                              <ProtectedRoute>
                                <MyHubPage />
                              </ProtectedRoute>
                            }
                          />
                          
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
                          {/* /programs is the new English canonical path for marketplace */}
                          <Route path="/programs" element={<ProgramsListingPage />} />
                          <Route path="/piactr" element={<Navigate to="/programs" replace />} />
                          
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
                        </Route>
                        
                        {/* New Admin Dashboard with separate layout */}
                        <Route
                          path="/admin-panel"
                          element={
                            <ProtectedRoute requireSuperAdmin>
                              <AdminLayout />
                            </ProtectedRoute>
                          }
                        >
                          <Route index element={<AdminDashboardNew />} />
                          <Route path="projects" element={<AdminProjects />} />
                          <Route path="projects/:id" element={<AdminProjectHub />} />
                          <Route path="experts" element={<AdminExperts />} />
                          <Route path="users" element={<AdminUsers />} />
                          <Route path="sponsors" element={<AdminSponsors />} />
                          <Route path="programs" element={<AdminPrograms />} />
                          <Route path="events" element={<AdminEvents />} />
                          <Route path="feedback" element={<AdminFeedback />} />
                          <Route path="analytics" element={<AdminAnalytics />} />
                          <Route path="financials" element={<AdminFinancials />} />
                          <Route path="audit" element={<AdminAudit />} />
                          <Route path="settings" element={<AdminSettings />} />
                        </Route>
                      </Routes>
                    </Suspense>
                    <Toaster />
                    <SonnerToaster />
                  </BrowserRouter>
                  </RegionProvider>
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
