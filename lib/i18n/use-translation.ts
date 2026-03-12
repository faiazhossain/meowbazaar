"use client";

import { useLocaleStore } from "@/lib/stores/locale-store";
import { translations, type Locale } from "./translations";

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & string]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : Key;
}[keyof ObjectType & string];

type TranslationKeys = NestedKeyOf<typeof translations.bn>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

  return typeof value === "string" ? value : path;
}

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);
  const isHydrated = useLocaleStore((state) => state.isHydrated);

  const t = (key: TranslationKeys, params?: Record<string, string>): string => {
    let text = getNestedValue(translations[locale] as unknown as Record<string, unknown>, key);

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, paramValue);
      });
    }

    return text;
  };

  return {
    t,
    locale,
    isHydrated,
  };
}

export type { Locale, TranslationKeys };
