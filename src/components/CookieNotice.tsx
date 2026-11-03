import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { COOKIE_NOTICE_EVENT, dismissCookieNotice, hasCookieNotice } from '../lib/cookie-notice';
import '../styles/cookie-notice.css';

export default function CookieNotice() {
  const [visible, setVisible] = useState(() =>
    typeof document === 'undefined' || !hasCookieNotice(document),
  );
  useEffect(() => {
    const review = () => {
      setVisible(true);
      requestAnimationFrame(() => document.getElementById('cookie-notice-title')?.focus());
    };
    window.addEventListener(COOKIE_NOTICE_EVENT, review);
    return () => window.removeEventListener(COOKIE_NOTICE_EVENT, review);
  }, []);

  if (!visible) return null;

  return <aside className="cookie-notice" aria-labelledby="cookie-notice-title">
    <div className="page cookie-notice-layout">
      <div className="cookie-notice-copy">
        <h2 id="cookie-notice-title" tabIndex={-1}>Cookies & privacy</h2>
        <p>We use one cookie to remember this notice. Your saved items stay in this browser. No advertising or analytics cookies.</p>
      </div>
      <div className="cookie-notice-actions">
        <Link to="/privacy#cookie-notice">Privacy details</Link>
        <button type="button" className="button button-primary" onClick={() => {
          dismissCookieNotice(document);
          // If cookies are blocked, dismiss for this visit without claiming persistence.
          setVisible(false);
          requestAnimationFrame(() => document.getElementById('main-content')?.focus({ preventScroll: true }));
        }}>Got it</button>
      </div>
    </div>
  </aside>;
}
