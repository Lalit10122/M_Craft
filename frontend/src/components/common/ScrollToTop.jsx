import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Scrolls to top on forward navigation (PUSH), but preserves
 * scroll position on back/forward (POP) browser navigation.
 * Place this inside <Router> once — it covers every route automatically.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Only scroll to top on PUSH (link click, navigate()) or REPLACE.
    // POP = browser back/forward — let the browser restore scroll naturally.
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
};

export default ScrollToTop;
