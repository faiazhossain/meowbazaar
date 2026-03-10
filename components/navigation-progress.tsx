"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
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

  // Track if component is mounted to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);

  const endNavigation = useCallback(() => {
    setIsNavigating(false);
  }, []);

  // End navigation when route changes complete
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Intercept link clicks to show loading state
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external links, hash links, and download links
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

      // Skip if modifier keys are pressed (open in new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      // Check if it's a different page
      const currentPath = window.location.pathname + window.location.search;
      const newPath = href.startsWith("/") ? href : `/${href}`;

      if (currentPath !== newPath) {
        setIsNavigating(true);
      }
    };

    // Handle form submissions
    const handleSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      if (form.getAttribute("data-no-loading") === "true") return;
      setIsNavigating(true);
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit);
    };
  }, []);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    if (!isNavigating) return;

    const timeout = setTimeout(() => {
      setIsNavigating(false);
    }, 10000); // 10 second max

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
