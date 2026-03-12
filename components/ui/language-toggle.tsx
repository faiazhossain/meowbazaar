"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocaleStore } from "@/lib/stores/locale-store";
import { useTranslation } from "@/lib/i18n/use-translation";

export function LanguageToggle() {
  const { t, locale } = useTranslation();
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-orange-600 hover:bg-orange-100 hover:text-orange-700 active:scale-95 transition-all gap-1 px-2 min-w-[44px] min-h-[44px]"
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium">{locale === "bn" ? "BN" : "EN"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-orange-200 bg-white"
      >
        <DropdownMenuItem
          onClick={() => setLocale("bn")}
          className={`cursor-pointer hover:text-orange-600 hover:bg-orange-50 ${locale === "bn" ? "bg-orange-50 text-orange-600" : ""}`}
        >
          {t("language.bangla")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale("en")}
          className={`cursor-pointer hover:text-orange-600 hover:bg-orange-50 ${locale === "en" ? "bg-orange-50 text-orange-600" : ""}`}
        >
          {t("language.english")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LanguageToggleMobile() {
  const { t, locale } = useTranslation();
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <div className="flex items-center gap-2 p-4 bg-white border-t border-orange-200">
      <Globe className="h-4 w-4 text-orange-500" />
      <span className="text-sm text-gray-600">Language:</span>
      <button
        onClick={() => setLocale("bn")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          locale === "bn"
            ? "bg-orange-500 text-white"
            : "bg-orange-100 text-orange-600 hover:bg-orange-200"
        }`}
      >
        BN
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          locale === "en"
            ? "bg-orange-500 text-white"
            : "bg-orange-100 text-orange-600 hover:bg-orange-200"
        }`}
      >
        EN
      </button>
    </div>
  );
}
