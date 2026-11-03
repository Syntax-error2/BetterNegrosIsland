export const COOKIE_NOTICE_NAME = 'bni_notice';
export const COOKIE_NOTICE_VERSION = 'v1';
export const COOKIE_NOTICE_MAX_AGE = 180 * 24 * 60 * 60;
export const COOKIE_NOTICE_EVENT = 'bni:review-cookie-notice';

/** A shared version value, never a visitor identifier or tracking preference. */
export function hasCookieNotice(cookies: Pick<Document, 'cookie'>): boolean {
  try {
    return cookies.cookie.split(';').some(part =>
      part.trim() === `${COOKIE_NOTICE_NAME}=${COOKIE_NOTICE_VERSION}`,
    );
  } catch { return false; }
}

export function dismissCookieNotice(cookies: Pick<Document, 'cookie'>): boolean {
  try {
    cookies.cookie = `${COOKIE_NOTICE_NAME}=${COOKIE_NOTICE_VERSION}; Max-Age=${COOKIE_NOTICE_MAX_AGE}; Path=/; SameSite=Lax; Secure`;
    return hasCookieNotice(cookies);
  } catch { return false; }
}

export function reviewCookieNotice(): void {
  window.dispatchEvent(new Event(COOKIE_NOTICE_EVENT));
}
