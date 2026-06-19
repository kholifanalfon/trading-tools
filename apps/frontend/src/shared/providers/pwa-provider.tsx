import React, { createContext, useContext, useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

interface PwaContextType {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  checkForUpdates: () => Promise<void>;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (r) {
        registrationRef.current = r;
        console.log("Service Worker registered successfully:", swUrl);
      }
    },
    onRegisterError(error) {
      console.error("Service Worker registration failed:", error);
    }
  });

  const checkForUpdates = async () => {
    if (registrationRef.current) {
      try {
        console.log("Checking for updates via service worker registration...");
        await registrationRef.current.update();
      } catch (err) {
        console.error("Failed to check for updates:", err);
      }
    } else if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      try {
        console.log("Checking for updates via navigator.serviceWorker registrations...");
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.update();
        }
      } catch (err) {
        console.error("Failed to check for updates (fallback):", err);
      }
    }
  };

  // Periodic check (every 5 minutes)
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Check once on load after a brief delay
    const initialCheck = setTimeout(() => {
      checkForUpdates();
    }, 5000);

    const interval = setInterval(() => {
      checkForUpdates();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, []);

  return (
    <PwaContext.Provider
      value={{
        needRefresh,
        offlineReady,
        updateServiceWorker,
        checkForUpdates,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error("usePwa must be used within a PwaProvider");
  }
  return context;
}
