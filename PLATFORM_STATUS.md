# WellAgora — Platform Státusz
**Generálva:** 2026-02-09 15:27
**Branch:** main
**Utolsó commit:** 8a28315 fix: correct edge function name create-checkout → create-checkout-session (2026-02-09 15:22:09 +0100)

---

## 1. ADATBÁZIS — expert_contents oszlopok
```
    ALTER TABLE public.expert_contents ADD COLUMN is_featured boolean DEFAULT false;
    ALTER TABLE public.expert_contents ADD COLUMN sort_order integer DEFAULT 0;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'free' CHECK (access_type IN ('free', 'paid', 'sponsored'));
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'online';
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'HUF';
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS description_de TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS event_location TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT false;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS original_price INTEGER;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES profiles(id);
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS sponsor_logo_url TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS sponsor_name TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS sponsored_at TIMESTAMPTZ;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS title_de TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS tools_needed TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS total_licenses INTEGER DEFAULT 0;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS used_licenses INTEGER DEFAULT 0;
ALTER TABLE public.expert_contents ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.expert_contents ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE public.expert_contents ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.expert_contents ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.expert_contents ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id);
CREATE TABLE IF NOT EXISTS public.expert_contents (
```

## 2. ROUTE-OK
```
*
/
/adatkezeles
/admin-dashboard
/admin-panel
/agb
/ai-assistant
/aszf
/auth
/browse-programs
/business-dashboard
/challenges
/challenges/:challengeId
/community
/contact
/creator/dashboard
/creator/programs/:id/edit
/creator/programs/new
/creators/:id
/dashboard
/dashboard/handprint
/dashboard/handprint-calculator
/datenschutz
/dynamic-regional
/elo-alkalmak
/en-agoram
/esemenyek
/esemenyek/:id
/events
/explore-region
/impressum
/interactive-map
/iranyitopult
/join/:projectSlug
/join/org/:inviteCode
/kozosseg
/marketplace
/matching
/member-dashboard
/my-learning
/organization/:organizationId
/partners
/partners/:slug
/piacer
/piacer/:id
/piactr
/privacy
/privacy-policy
/profile/:userId
/programs
/programs/:id
/projects
/purchase/cancel
/purchase/success
/regional-hub
/register/organization
/revolutionary
/sajat-kozpont
/sponsor
/sponsor/:sponsorId
/szakertoi-studio
/szakertoi-studio/:id/szerkesztes
/szakertoi-studio/uj
/szakertoi-studio/uj-utmutato
/szakertok/:id
/tamogato-panel
/tamogatoi-kozpont
/terms
analytics
audit
events
experts
feedback
financials
programs
projects
projects/:id
settings
sponsors
src/App.tsx:128:                        <Routes>
src/App.tsx:134:                        <Route element={<TermsCheckWrapper />}>
src/App.tsx:135:                          <Route element={<AppLayout />}>
src/App.tsx:168:                          <Route
src/App.tsx:177:                          <Route
src/App.tsx:183:                          <Route
src/App.tsx:196:                          <Route
src/App.tsx:207:                          <Route
src/App.tsx:215:                          <Route
src/App.tsx:233:                          <Route
src/App.tsx:242:                          <Route
src/App.tsx:253:                          <Route
src/App.tsx:261:                          <Route
src/App.tsx:269:                          <Route
src/App.tsx:277:                          <Route
src/App.tsx:285:                          <Route
src/App.tsx:293:                          <Route
src/App.tsx:301:                          <Route
src/App.tsx:309:                          <Route
src/App.tsx:317:                          <Route
src/App.tsx:327:                          <Route
src/App.tsx:335:                          <Route
src/App.tsx:343:                          <Route
src/App.tsx:368:                          <Route
src/App.tsx:376:                          <Route
src/App.tsx:384:                          <Route
src/App.tsx:394:                          <Route
src/App.tsx:404:                          <Route
src/App.tsx:414:                          <Route
src/App.tsx:422:                          <Route
src/App.tsx:432:                          <Route
src/App.tsx:446:                          <Route
src/App.tsx:454:                          <Route
src/App.tsx:479:                        <Route
src/App.tsx:487:                          <Route index element={<AdminDashboardNew />} />
users
```

## 3. OLDALAK
```
AIAssistant.tsx
AIAssistantPage.tsx
AboutPage.tsx
AdminDashboardPage.tsx
AuthPage.tsx
BrowseProgramsPage.tsx
CommunityPage.tsx
ContactPage.tsx
ControlPanelPage.tsx
CreatorDashboardPage.tsx
CreatorProgramEditPage.tsx
CreatorProgramNewPage.tsx
CreatorPublicProfilePage.tsx
Dashboard.tsx
DashboardPage.tsx
ErrorPage.tsx
EventDetailPage.tsx
EventDetailPageNew.tsx
EventsPage.tsx
EventsPageNew.tsx
ExpertAnalytics.tsx
ExpertMedia.tsx
ExpertPayouts.tsx
ExpertPrograms.tsx
ExpertSettings.tsx
ExpertStudio.tsx
ExploreRegionPage.tsx
FavoritesPage.tsx
HandprintCalculatorPage.tsx
HandprintPage.tsx
HelpPage.tsx
ImpressumPage.tsx
InboxPage.tsx
Index.tsx
JoinOrganizationPage.tsx
JoinProjectPage.tsx
MemberDashboard.tsx
MyAgoraPage.tsx
MyCoursesPage.tsx
MyHubPage.tsx
MyLearningPage.tsx
NotFound.tsx
NotificationsPage.tsx
OrganizationDashboard.tsx
OrganizationRegisterPage.tsx
PartnerProfilePage.tsx
PartnersPage.tsx
PointsHistoryPage.tsx
PrivacyPolicyPage.tsx
ProfilePage.tsx
ProgramDetailPage.tsx
ProgramLearnPage.tsx
ProgramLearnPageNew.tsx
ProgramParticipantsPage.tsx
ProgramsListingPage.tsx
ProjectAdminPage.tsx
ProjectsListPage.tsx
PublicOrganizationPage.tsx
PurchaseSuccessPage.tsx
RegionalHub.tsx
SponsorCampaigns.tsx
SponsorDashboardPage.tsx
SponsorFinances.tsx
SponsorLandingPage.tsx
SponsorOnboardingPage.tsx
SponsorPublicProfilePage.tsx
SponsorSupport.tsx
SuperAdminPage.tsx
TermsOfServicePage.tsx
TranslationToolPage.tsx
WorkshopSecretViewPage.tsx
```

## 4. FŐ KOMPONENSEK

### Expert:
```
```

### Marketplace:
```
marketplace/AffiliateProductsDisplay.tsx
marketplace/DummyPaymentModal.tsx
marketplace/LivePulseToast.tsx
marketplace/SocialProofBadge.tsx
marketplace/SponsorContributionBadge.tsx
marketplace/SponsoredPriceBadge.tsx
marketplace/SponsorshipModal.tsx
marketplace/VerifiedExpertBadge.tsx
```

### Admin:
```
admin/AIAnalyticsDashboard.tsx
admin/AdminDashboard.tsx
admin/BulkTranslationTool.tsx
admin/HungaryMap.tsx
admin/LegalContentManager.tsx
admin/MessagesManager.tsx
admin/ProgramCreator.tsx
admin/ProgramEditor.tsx
admin/ProjectDetailView.tsx
admin/RoleSwitcher.tsx
admin/TranslateAllButton.tsx
admin/UserRoleManager.tsx
admin/WorldMap.tsx
```

### Dashboard:
```
dashboard/ActiveNowStats.tsx
dashboard/CommunityActivityFeed.tsx
dashboard/CommunityImpactProgress.tsx
dashboard/Dashboard.tsx
dashboard/DashboardCard.tsx
dashboard/DashboardCitizenView.tsx
dashboard/DashboardHeader.tsx
dashboard/DashboardOrganizationView.tsx
dashboard/DashboardRoleSelector.tsx
dashboard/DashboardStats.tsx
dashboard/EventsWidget.tsx
dashboard/ForestGrowth.tsx
dashboard/HandprintCalculator.tsx
dashboard/HandprintWidget.tsx
dashboard/ImpactDashboardWidget.tsx
dashboard/JourneyTimeline.tsx
dashboard/KPICard.tsx
dashboard/MobilizeTeamModal.tsx
dashboard/MyEventsWidget.tsx
dashboard/NearbyWidget.tsx
dashboard/OrganizationChallengeStats.tsx
dashboard/OrganizationSponsorModal.tsx
dashboard/PersonalImpactGarden.tsx
dashboard/ProgramCalendar.tsx
dashboard/ProjectActivities.tsx
dashboard/ProjectLeaderboard.tsx
dashboard/RegionalImpactMap.tsx
dashboard/RegionalProgramsHighlight.tsx
dashboard/SponsorChallengeModal.tsx
dashboard/SponsorDashboardView.tsx
dashboard/UserProgramsList.tsx
```

### AI:
```
ai/AIAssistantChat.tsx
ai/WellBotAvatar.tsx
ai/WellBotWidget.tsx
```

## 5. SERVICES
```
AffiliateTrackingService.ts: 2 exports
AnalyticsService.ts: 2 exports
SponsorImpactService.ts: 4 exports
enrollmentService.ts: 7 exports
transactionService.ts: 6 exports
translationService.ts: 4 exports
```

## 6. EDGE FUNCTIONS
```
ai-chat
analyze-media
bulk-translate
challenge-validation
create-checkout-session
create-connect-account
generate-challenge
health-check
match-challenge
seed-test-data
send-contact-email
send-event-reminders
send-event-rsvp-confirmation
send-general-contact
send-purchase-confirmation
send-push-notification
send-sponsorship-alert
send-team-invitation
send-welcome-email
sponsor-low-balance-alert
stripe-webhook
translate-challenge
translate-content
verify-admin-access
```

## 7. EXPERT STUDIO FORM — tartalom mezők UI-ban
```
```

## 8. MARKETPLACE KÁRTYA — megjelenített adatok
```
src/components/marketplace/SponsorshipModal.tsx:20: price_huf: number;
src/components/marketplace/SponsorshipModal.tsx:43: const totalCost = content.price_huf * licenseCount;
src/components/marketplace/SponsorshipModal.tsx:120: {t('marketplace.original_price')}: {content.price_huf.toLocaleString()} Ft / {t('marketplace.per_person')}
src/components/marketplace/SponsorshipModal.tsx:156: {licenseCount} {t('sponsor.licenses')} × {content.price_huf.toLocaleString()} Ft
src/components/marketplace/DummyPaymentModal.tsx:20: price_huf: number;
src/components/marketplace/DummyPaymentModal.tsx:67: amount_paid: content.price_huf,
src/components/marketplace/DummyPaymentModal.tsx:73: const platformAmount = Math.round(content.price_huf * 0.20);
src/components/marketplace/DummyPaymentModal.tsx:74: const creatorAmount = content.price_huf - platformAmount;
src/components/marketplace/DummyPaymentModal.tsx:80: amount: content.price_huf,
src/components/marketplace/DummyPaymentModal.tsx:121: {content.price_huf.toLocaleString()} Ft
src/components/marketplace/DummyPaymentModal.tsx:165: `${t('payment.pay')} ${content.price_huf.toLocaleString()} Ft`
```

## 9. REVIEW RENDSZER
```
components/community/FeaturedExpertSection.tsx
components/expert-studio/ExpertAnalyticsDashboard.tsx
components/reviews/ReviewSection.tsx
components/reviews/StarRating.tsx
pages/CreatorPublicProfilePage.tsx
pages/ProgramDetailPage.tsx
```

## 10. NOTIFICATION RENDSZER
```
```

## 11. STRIPE / FIZETÉS
```
create-checkout-session
stripe-webhook
 * Start paid checkout via Stripe (creates checkout session via edge function)
  // Call Stripe checkout edge function
```

## 12. TESZTEK
```
enrollment.test.ts
financial.test.ts
security.test.ts
wellbot.test.ts
```

## 13. FLYWHEEL CHECKLIST

| # | Lépés | Szükséges | Létezik? |
|---|-------|-----------|----------|
| 1 | Expert tartalom form | content_type UI | ✅ |
| 2 | Ingyenes regisztráció | enrollFree() | ✅ |
| 3 | Fizetős vásárlás | startPaidCheckout() | ✅ |
| 4 | Stripe Checkout edge fn | create-checkout/ | ❌ |
| 5 | Stripe Webhook | stripe-webhook/ | ✅ |
| 6 | Tag értékelés | ReviewSection | ✅ |
| 7 | WellBot Expert Coach | getRoleSystemPrompt | ✅ |
| 8 | Nudge értesítések | milestone notification | ❌ |
| 9 | Expert bevétel dashboard | earnings.*transactions | ✅ |
| 10 | Admin tranzakció lista | admin.*transactions | ✅ |

---
*Generálva: scripts/generate-status.sh*
