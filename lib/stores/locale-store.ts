import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Locale } from "@/lib/i18n/translations";

interface LocaleState {
  locale: Locale;
  isHydrated: boolean;
  setLocale: (locale: Locale) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "bn",
      isHydrated: false,

      setLocale: (locale) => {
        set({ locale });
      },

      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: "locale-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const isClient = typeof window !== "undefined";
