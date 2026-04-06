/** Ключ localStorage: согласие с политикой и cookie (не блокирует необходимые cookie сессии). */
export const COOKIE_CONSENT_STORAGE_KEY = "moscasting_consent_v1";

export function persistCookieConsent(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "accepted");
  } catch {
    /* storage недоступен */
  }
}

export function readCookieConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}
