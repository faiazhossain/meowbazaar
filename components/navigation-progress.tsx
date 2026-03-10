"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CatLoader } from "@/components/ui/cat-loader";

interface NavigationProgressContextType {
  isNavigating: boolean;
  startNavigation: () => void;
  endNavigation: () => void;
}

const NavigationProgressContext = createContext<NavigationProgressContextType>({
  isNavigating: false,
  startNavigation: () => {},
  endNavigation: () => {},
});

export function useNavigationProgress() {
  return useContext(NavigationProgressContext);
}

export function NavigationProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pendingNavigationRef = useRef<string | null>(null);

  // Track if component is mounted to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);

  const endNavigation = useCallback(() => {
    setIsNavigating(false);
    pendingNavigationRef.current = null;
  }, []);

  // End navigation when route changes complete
  useEffect(() => {
    // Only end navigation if we were actually navigating to a new route
    if (pendingNavigationRef.current) {
      setIsNavigating(false);
      pendingNavigationRef.current = null;
    }
  }, [pathname, searchParams]);

  // Listen for actual navigation using a more targeted approach
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      // Skip if the event was already prevented (e.g., by add to cart handlers)
      if (e.defaultPrevented) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip non-navigation links
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("target") === "_blank"
      ) {
        return;
      }

      // Skip if modifier keys are pressed
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      // Skip links with data-no-progress attribute (for action buttons)
      if (anchor.hasAttribute("data-no-progress")) {
        return;
      }

      // Check if it's a different page
      const currentPath = window.location.pathname + window.location.search;
      const newPath = href.startsWith("/") ? href : `/${href}`;

      if (currentPath !== newPath) {
        pendingNavigationRef.current = newPath;
        setIsNavigating(true);
      }
    };

    // Use capture phase to check before any handlers might prevent default
    // but check defaultPrevented in a microtask to see if it was prevented
    const handleClickCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip non-navigation links
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("target") === "_blank" ||
        anchor.hasAttribute("data-no-progress")
      ) {
        return;
      }

      // Skip if modifier keys are pressed
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      // Use microtask to check if navigation was prevented
      queueMicrotask(() => {
        if (e.defaultPrevented) {
          // Navigation was canceled, don't show loader
          return;
        }

        const currentPath = window.location.pathname + window.location.search;
        const newPath = href.startsWith("/") ? href : `/${href}`;

        if (currentPath !== newPath) {
          pendingNavigationRef.current = newPath;
          setIsNavigating(true);
        }
      });
    };

    document.addEventListener("click", handleClickCapture, { capture: true });

    return () => {
      document.removeEventListener("click", handleClickCapture, {
        capture: true,
      });
    };
  }, []);

  // Safety timeout - reduced to 5 seconds for better UX
  useEffect(() => {
    if (!isNavigating) return;

    const timeout = setTimeout(() => {
      setIsNavigating(false);
      pendingNavigationRef.current = null;
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isNavigating]);

  return (
    <NavigationProgressContext.Provider
      value={{ isNavigating, startNavigation, endNavigation }}
    >
      {children}

      {/* Loading Overlay - only render after mount to avoid hydration issues */}
      {isMounted && isNavigating && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-background/60 backdrop-blur-sm transition-all duration-300"
          role="progressbar"
          aria-label="Page loading"
        >
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-200">
            <CatLoader size="lg" text="লোড হচ্ছে..." />
          </div>
        </div>
      )}
    </NavigationProgressContext.Provider>
  );
}
