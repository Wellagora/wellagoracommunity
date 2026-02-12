---
description: Audit UI/UX issues across key pages (responsive, i18n, empty states, loading)
---

## UX Audit Workflow

1. Read the main layout and navigation components to check for consistency:
   - `src/components/layout/AppLayout.tsx`
   - `src/components/Navigation.tsx`
   - `src/components/navigation/MobileBottomNav.tsx`
   - `src/components/Footer.tsx`

2. Check all pages for sticky header conflicts (should be `top-16`, not `top-0`):
   - Search for `sticky top-0` across all TSX files — these are potential bugs

3. Check for missing i18n keys:
   - Search for hardcoded Hungarian strings in TSX files (outside of fallback `||` patterns)

4. Check empty states exist for all list pages:
   - `src/pages/ProgramsListingPage.tsx`
   - `src/pages/EventsPageNew.tsx`
   - `src/components/community/CommunityFeed.tsx`

5. Check loading skeletons exist for all data-fetching pages

6. Report findings with file paths and line numbers
