"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/use-translation";
import { Button } from "@/components/ui/button";

interface SectionHeaderClientProps {
  titleKey: string;
  subtitleKey?: string;
  href?: string;
  linkTextKey?: string;
  className?: string;
}

export function SectionHeaderClient({
  titleKey,
  subtitleKey,
  href,
  linkTextKey = "sections.viewAll",
  className,
}: SectionHeaderClientProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex items-center justify-between mb-8", className)}>
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {t(titleKey)}
        </h2>
        {subtitleKey && <p className="text-muted-foreground mt-1">{t(subtitleKey)}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-brand-orange-dark transition-colors"
        >
          {t(linkTextKey)}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

interface OfferBannerClientProps {
  variant?: "primary" | "accent";
  ctaHref: string;
}

export function OfferBannerClient({
  variant = "primary",
  ctaHref,
}: OfferBannerClientProps) {
  const { t } = useTranslation();

  const bgClass =
    variant === "primary"
      ? "bg-gradient-to-r from-primary to-brand-orange-dark"
      : "bg-gradient-to-r from-accent to-mint";

  return (
    <section className={`${bgClass} py-10 md:py-14`}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3 text-balance">
          {t("offer.bkashCashback")}
        </h2>
        <p className="text-primary-foreground/90 text-lg mb-6 max-w-2xl mx-auto text-pretty">
          {t("offer.bkashCashbackDesc")}
        </p>
        <Link href={ctaHref}>
          <Button
            size="lg"
            className={
              variant === "primary"
                ? "bg-card text-primary hover:bg-card/90"
                : "bg-card text-accent hover:bg-card/90"
            }
          >
            {t("offer.orderNow")}
          </Button>
        </Link>
      </div>
    </section>
  );
}
