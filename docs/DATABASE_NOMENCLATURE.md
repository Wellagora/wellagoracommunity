# Database Nomenclature & Entity Mapping

This document maps user-facing Hungarian terms to database entities for consistent AI indexing and developer reference.

## Core Entities

| User-Facing (HU) | User-Facing (EN) | Database Table | Description |
|------------------|------------------|----------------|-------------|
| Tag | Member | `profiles` | Platform user with `user_role` field |
| Program | Program | `expert_contents` | Main content type (courses, workshops) |
| Esemény | Event | `events` | Calendar-based events |
| Szponzor | Sponsor | `sponsors`, `profiles` | Organization or individual sponsor |
| Szakértő | Expert | `profiles` (role=expert) | Content creator with verified status |
| Kupon | Voucher | `vouchers` | User's claimed access to sponsored content |
| Kedvenc | Favorite | `favorites` | User's saved/bookmarked content |

## Sponsorship System

| Term (HU) | Term (EN) | Database Field | Location |
|-----------|-----------|----------------|----------|
| Támogatott helyek | Sponsored seats | `max_sponsored_seats` | `content_sponsorships` |
| Felhasznált helyek | Used seats | `sponsored_seats_used` | `content_sponsorships` |
| Támogatói hozzájárulás | Sponsor contribution | `sponsor_contribution_huf` | `content_sponsorships` |
| Kredit egyenleg | Credit balance | `available_credits` | `sponsor_credits` |

## User Roles

| Role (DB) | Description (HU) | Description (EN) |
|-----------|------------------|------------------|
| `member` | Alapfelhasználó | Basic member |
| `expert` | Szakértő | Expert/Content creator |
| `sponsor` | Szponzor | Sponsor organization |
| `admin` | Rendszergazda | Administrator |

## Content Types

| Type (DB) | Description (HU) | Description (EN) |
|-----------|------------------|------------------|
| `in_person` | Élő esemény | In-person event |
| `online_live` | Online élő | Live online session |
| `recorded` | Videókurzus | Pre-recorded video |

## AI Metadata Fields

| Field | Table | Purpose |
|-------|-------|---------|
| `problem_solution` | `expert_contents` | JSONB with `{problem, solution}` for AI search |
| `seo_title` | `expert_contents` | SEO-optimized title |
| `seo_description` | `expert_contents` | SEO meta description |
| `og_image_url` | `expert_contents` | Open Graph image for social sharing |

## Foreign Key Relationships

```
profiles (user_id) <- vouchers.user_id
expert_contents <- vouchers.content_id
expert_contents <- favorites.content_id
expert_contents <- content_sponsorships.content_id
sponsors <- content_sponsorships.sponsor_id
```

## Atomic Operations

For concurrent operations (e.g., voucher claims), use the RPC function:
```sql
check_and_reserve_sponsored_seat(p_sponsorship_id, p_user_id)
```

This prevents race conditions when multiple users claim sponsored seats simultaneously.

---

*Last updated: 2026-01-19*
