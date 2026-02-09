# _archive — Archivált komponensek

Ide kerültek azok a komponensek, amelyek a jelenlegi platformon **nem aktívak**, de a bennük lévő UI pattern-ek értékesek lehetnek a jövőben.

## Miért nem töröltük?

- A kód korábban fejlesztett feature-öket tartalmaz
- Egyes UI pattern-ek (dark theme onboarding, social feed layout) később újra felhasználhatók
- Nem akarjuk újra fejleszteni ami egyszer már elkészült

## Tartalom

### `/onboarding/`
- **SmartOnboarding.tsx** — Régi onboarding wizard (angol, SustainHub branding, dark theme)
- **OnboardingWizard.tsx** — Enhanced onboarding (538 sor, multi-step, angol)
- **RoleSelector.tsx** — Régi szerepválasztó (citizen/business/government/ngo)

### `/community/`
- **SocialFeed.tsx** — Régi közösségi fal (731 sor, mock adatok, nem DB-backed)

## Mikor használd újra?

- Ha dark theme onboarding kell → `onboarding/SmartOnboarding.tsx`
- Ha összetett wizard flow kell → `onboarding/OnboardingWizard.tsx`
- Ha alternatív feed layout kell → `community/SocialFeed.tsx`

---

Archiválva: 2026-02-09, Pilot előkészítés keretében
