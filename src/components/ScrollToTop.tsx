import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** A new page starts at the top; in-page links (#districts) are left to the page. */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
    // Legal/source anchors can arrive before a lazy route has mounted.
    let targetId = hash.slice(1);
    try { targetId = decodeURIComponent(targetId); } catch { /* Keep malformed fragments inert. */ }
    const move = () => {
      const target = targetId ? document.getElementById(targetId) : document.getElementById('main-content');
      if (!target || target.hasAttribute('data-route-loading')) return false;
      if (targetId) {
        target.scrollIntoView({ block: 'start', behavior: 'instant' });
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
      else target.focus({ preventScroll: true });
      return true;
    };
    if (move()) return;
    const observer = new MutationObserver(() => { if (move()) observer.disconnect(); });
    observer.observe(document.getElementById('root')!, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname, hash]);
  return null;
}
