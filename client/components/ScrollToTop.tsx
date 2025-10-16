import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior });
    });
  }, [location.pathname, location.search]);

  return null;
};

export default ScrollToTop;
