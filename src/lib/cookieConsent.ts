/**
 * Cookie consent utilities — separated from the React component
 * to avoid breaking Vite Fast Refresh (named exports from component files
 * are incompatible with HMR).
 */

export const COOKIE_CONSENT_KEY = "wellagora_cookie_consent";

export const resetCookieConsent = () => {
  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  } catch {
    // noop
  }
  window.dispatchEvent(new Event("cookie-consent-reset"));
};

export const hasStoredConsent = (): boolean => {
  try {
    return !!localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch {
    return false;
  }
};

export const saveConsentToStorage = (choice: string): void => {
  try {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({ choice, timestamp: new Date().toISOString() })
    );
  } catch {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    } catch {
      console.error("Failed to save cookie consent to localStorage");
    }
  }
};
