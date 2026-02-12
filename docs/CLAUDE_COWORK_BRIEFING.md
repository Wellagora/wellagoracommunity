# WellAgora — AI Collaborator Briefing

## What is WellAgora?

WellAgora is a **three-sided regional community marketplace** focused on sustainability. It connects:

1. **Experts (Creators)** — Local sustainability professionals who create programs (workshops, courses, events)
2. **Members (Tags)** — Community members who discover and enroll in programs
3. **Sponsors** — Businesses that fund programs and members for ESG/local branding

## Tech Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Edge Functions, Realtime, Storage)
- **Payments:** Stripe (80% Expert / 20% Platform split)
- **AI:** WellBot (role-based coaching assistant)
- **i18n:** Hungarian (primary), English, German
- **CI/CD:** GitHub Actions → Build + Test + DB Migration
- **Hosting:** Netlify (demo.wellagora.org)

## Business Model

- **Revenue split:** 80% goes to Expert, 20% to Platform (configurable)
- **Sponsor credits:** Businesses buy credits → fund member enrollments
- **WellPoints:** Gamification system (max 20% discount, not combinable with sponsor)
- **Founding Expert Program:** First invited experts get permanent privileges (golden badge, 0% platform fee during pilot)

## Current Status (Feb 2026)

**Platform is technically complete.** We are at **Marketplace Maturity Level 1 (Supply Side)** per the a16z framework. The technology is far ahead of the business — zero real users yet.

### What's Built ✅
- Expert Studio (4-step program creation wizard)
- Marketplace (category filtering, search, program cards, enrollment flow)
- Events (listing, detail, RSVP)
- Community Feed (posts, comments, likes, WellPoints, image upload)
- WellBot AI (role-based coaching)
- Notifications (real-time, push)
- Admin Panel (financials, user management, analytics)
- Auth (registration, login, demo mode, password reset, 3 roles)
- Founding Expert badge + dual-role Expert↔Tag toggle
- Seed content SQL (ready to run)
- CI/CD pipeline (GitHub Actions)

### What's Needed 🎯
- **5 Founding Experts** to register and create content
- **10+ programs** published
- **First real enrollment** (the most critical milestone)
- **30-50 Tags** invited through Expert networks

## Road to Market Strategy (4 Phases, 12 Weeks)

1. **SEED (Week 1-3):** Recruit 5 Founding Experts personally, 1-on-1 demos, Playbook handoff
2. **NURTURE (Week 4-6):** Content critical mass (10+ programs, 50+ posts), weekly Expert calls, first LIVE program
3. **OPEN (Week 7-9):** Tag acquisition through Expert networks (NOT mass marketing)
4. **GROW (Week 10-12):** Flywheel validation — retention, organic growth, first paid enrollment

## Key Principles & Rules

- **Supply-first:** Build Expert side before inviting Tags
- **Database-first:** No hardcoded/mock data
- **Terminology:** Programs (NOT Műhelytitkok), Tag/Member/Mitglied, Szakértő/Expert, WellPoints
- **i18n:** Always 3 languages (HU/EN/DE)
- **Archive, don't delete:** Old code goes to `src/_archive/`, not trash
- **Small commits:** Focused, descriptive
- **Audit-first:** Review before changing

## Repository Structure

```
wellagoracommunity/
├── src/
│   ├── components/       # UI components (Navigation, Footer, community/, admin/, etc.)
│   ├── contexts/         # AuthContext, LanguageContext
│   ├── hooks/            # Custom hooks (useRoleRedirect, useCommunityHub, etc.)
│   ├── lib/              # Utilities (pricing.ts, wellpoints.ts, supabase client)
│   ├── locales/          # hu.json, en.json, de.json
│   ├── pages/            # Route pages
│   ├── services/         # enrollmentService, transactionService
│   ├── constants/        # categories.ts, shared constants
│   └── _archive/         # Archived components (not deleted, potentially reusable)
├── supabase/
│   └── migrations/       # SQL migrations (run in Supabase SQL Editor)
├── docs/
│   └── FOUNDING_EXPERT_PLAYBOOK.md
└── .github/workflows/    # CI/CD (ci.yml, health.yml)
```

## Supabase Details

- **Project Ref:** vvunxewylcifwphxgqab
- **Key tables:** profiles, expert_contents, events, community_posts, community_post_likes, community_post_comments, transactions, content_access, event_rsvps, notifications, push_subscriptions, sponsor_credits
- **Key columns on profiles:** user_role, is_super_admin, is_founding_expert, founding_expert_since, can_view_as_member, expert_title, avatar_url

## How to Help

You can help with:
1. **Strategic advice** — Marketplace growth, Expert acquisition, community building
2. **Content creation** — Expert outreach emails, marketing copy, program descriptions
3. **Business analysis** — Pricing strategy, competitor analysis, metric interpretation
4. **Technical review** — Architecture decisions, code review, feature prioritization

## What NOT to Do

- Don't suggest rebuilding the tech stack — it's production-ready
- Don't suggest features before we have 5 active Experts
- Don't suggest mass marketing before content critical mass
- Don't suggest paid advertising before organic validation
