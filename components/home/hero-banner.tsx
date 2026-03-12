"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/use-translation";

export function HeroBanner() {
  const { t, locale } = useTranslation();

  const categoryLabels = {
    cat: locale === "en" ? "Cat" : "বিড়াল",
    dog: locale === "en" ? "Dog" : "কুকুর",
    bird: locale === "en" ? "Bird" : "পাখি",
    fish: locale === "en" ? "Fish" : "মাছ",
    rabbit: t("hero.rabbit"),
    other: t("hero.other"),
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream via-brand-orange-light/20 to-cream">
      <div className="container mx-auto px-4 py-12 md:py-20 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content - Left Side */}
          <div className="text-center lg:text-left space-y-6 md:space-y-8">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-snug">
              {t("hero.title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-brand-orange-dark text-primary-foreground px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg cursor-pointer w-full sm:w-auto"
              >
                <Link href="/products">{t("hero.startShopping")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg cursor-pointer w-full sm:w-auto"
              >
                <Link href="/products?category=food">{t("hero.viewPetFood")}</Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 sm:gap-4 md:gap-6 justify-center lg:justify-start pt-4 sm:pt-6">
              <TrustBadge icon="truck" text={t("hero.nationwideDelivery")} />
              <TrustBadge icon="shield" text={t("hero.original")} />
              <TrustBadge icon="cash" text={t("hero.cashOnDelivery")} />
            </div>

            {/* Mobile Category Grid - Only visible on mobile/tablet */}
            <div className="lg:hidden pt-6">
              <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                <MobileCategoryButton
                  href="/products?pet=cat"
                  icon="😺"
                  label={categoryLabels.cat}
                  color="bg-orange-100"
                />
                <MobileCategoryButton
                  href="/products?pet=dog"
                  icon="🐕"
                  label={categoryLabels.dog}
                  color="bg-purple-100"
                />
                <MobileCategoryButton
                  href="/products?pet=bird"
                  icon="🦜"
                  label={categoryLabels.bird}
                  color="bg-yellow-100"
                />
                <MobileCategoryButton
                  href="/products?pet=fish"
                  icon="🐠"
                  label={categoryLabels.fish}
                  color="bg-blue-100"
                />
                <MobileCategoryButton
                  href="/products?pet=rabbit"
                  icon="🐰"
                  label={categoryLabels.rabbit}
                  color="bg-pink-100"
                />
                <MobileCategoryButton
                  href="/products?pet=other"
                  icon="🦔"
                  label={categoryLabels.other}
                  color="bg-green-100"
                />
              </div>
            </div>
          </div>

          {/* Redesigned Visual - Right Side - Interactive Cards (Desktop only) */}
          <div className="relative hidden lg:block h-[600px] select-none">
            {/* Main Center Circle - Not Interactive */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="relative w-80 h-80">
                {/* Center Logo - Non-interactive */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40">
                  <div className="relative w-full h-full bg-gradient-to-br from-primary to-accent rounded-3xl shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl filter drop-shadow-lg">🐾</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Category Cards */}
                {/* Cat - Top */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                  <CategoryCard
                    icon="😺"
                    label={categoryLabels.cat}
                    color="bg-orange-100"
                    hoverColor="group-hover:bg-orange-200"
                    delay="0s"
                  />
                </div>

                {/* Dog- Right */}
                <div className="absolute top-1/2 -right-16 -translate-y-1/2">
                  <CategoryCard
                    icon="🐕"
                    label={categoryLabels.dog}
                    color="bg-purple-100"
                    hoverColor="group-hover:bg-purple-200"
                    delay="0.2s"
                  />
                </div>

                {/* Bird- Bottom */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                  <CategoryCard
                    icon="🦜"
                    label={categoryLabels.bird}
                    color="bg-yellow-100"
                    hoverColor="group-hover:bg-yellow-200"
                    delay="0.4s"
                  />
                </div>

                {/* Fish- Left */}
                <div className="absolute top-1/2 -left-16 -translate-y-1/2">
                  <CategoryCard
                    icon="🐠"
                    label={categoryLabels.fish}
                    color="bg-blue-100"
                    hoverColor="group-hover:bg-blue-200"
                    delay="0.6s"
                  />
                </div>

                {/* Small Pet- Rabbit */}
                <div className="absolute -top-8 -right-8">
                  <SmallCategoryCard
                    icon="🐰"
                    label={categoryLabels.rabbit}
                    color="bg-pink-100"
                    hoverColor="group-hover:bg-pink-200"
                    delay="0.8s"
                  />
                </div>

                {/* Other Pets */}
                <div className="absolute -bottom-8 -left-8">
                  <SmallCategoryCard
                    icon="🦔"
                    label={categoryLabels.other}
                    color="bg-green-100"
                    hoverColor="group-hover:bg-green-200"
                    delay="1s"
                  />
                </div>
              </div>
            </div>

            {/* Floating Product Icons- Interactive */}
            <div className="absolute top-20 right-20 animate-float-slow">
              <ProductIcon icon="🦴" />
            </div>

            <div
              className="absolute bottom-20 left-20 animate-float-slow"
              style={{ animationDelay: "0.5s" }}
            >
              <ProductIcon icon="🧶" />
            </div>

            <div
              className="absolute top-40 left-40 animate-float-slow"
              style={{ animationDelay: "1s" }}
            >
              <ProductIcon icon="🥩" />
            </div>

            <div
              className="absolute bottom-40 right-40 animate-float-slow"
              style={{ animationDelay: "1.5s" }}
            >
              <ProductIcon icon="🪶" />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements - Hidden on mobile to prevent overflow */}
      <div className="hidden lg:block absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="hidden lg:block absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="hidden md:block absolute top-1/4 left-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden md:block absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/3 rounded-full blur-3xl pointer-events-none" />

      <style jsx>{`
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes float-very-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(2deg);
          }
        }

        @keyframes pulse-gentle {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        .animate-float-very-slow {
          animation: float-very-slow 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

// Enhanced Category Card Component with hover effects
function CategoryCard({
  icon,
  label,
  color,
  hoverColor,
  delay,
}: {
  icon: string;
  label: string;
  color: string;
  hoverColor: string;
  delay: string;
}) {
  return (
    <div
      className="group relative animate-float-very-slow cursor-default"
      style={{ animationDelay: delay }}
    >
      <div className="relative w-28 h-28">
        {/* Main Card */}
        <div
          className={`
          absolute inset-0 ${color} ${hoverColor}
          rounded-2xl shadow-lg
          transition-all duration-300 ease-out
          group-hover:scale-150 group-hover:shadow-xl
          group-hover:-translate-y-2
          group-hover:rotate-2
        `}
        >
          <div className="h-full flex flex-col items-center justify-center gap-1 p-2">
            <span
              className="text-4xl filter drop-shadow-sm
              transition-transform duration-300
              group-hover:scale-150 group-hover:rotate-6"
            >
              {icon}
            </span>
            <span
              className="text-sm font-medium text-gray-700
              transition-all duration-300
              group-hover:font-bold"
            >
              {label}
            </span>
          </div>
        </div>

        {/* Glow Effect */}
        <div
          className={`
          absolute -inset-1 ${color.replace("100", "200")}
          rounded-3xl blur-md opacity-0
          group-hover:opacity-40 transition-all duration-300
          group-hover:scale-150
        `}
        />

        {/* Shine Effect */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
          transition-opacity duration-300 pointer-events-none
          bg-gradient-to-tr from-white/0 via-white/30 to-white/0
          group-hover:animate-shine"
        />
      </div>
    </div>
  );
}

// Enhanced Small Category Card
function SmallCategoryCard({
  icon,
  label,
  color,
  hoverColor,
  delay,
}: {
  icon: string;
  label: string;
  color: string;
  hoverColor: string;
  delay: string;
}) {
  return (
    <div
      className="group relative animate-float-very-slow cursor-default"
      style={{ animationDelay: delay }}
    >
      <div className="relative w-20 h-20">
        <div
          className={`
          absolute inset-0 ${color} ${hoverColor}
          rounded-xl shadow-md
          transition-all duration-300 ease-out
          group-hover:scale-150 group-hover:shadow-lg
          group-hover:-translate-y-2
          group-hover:rotate-2
        `}
        >
          <div className="h-full flex flex-col items-center justify-center gap-0.5 p-1">
            <span
              className="text-2xl transition-transform duration-300
              group-hover:scale-150 group-hover:rotate-6"
            >
              {icon}
            </span>
            <span
              className="text-xs font-medium text-gray-700
              transition-all duration-300
              group-hover:font-bold"
            >
              {label}
            </span>
          </div>
        </div>

        {/* Glow Effect */}
        <div
          className={`
          absolute -inset-1 ${color.replace("100", "200")}
          rounded-xl blur-md opacity-0
          group-hover:opacity-40 transition-all duration-300
          group-hover:scale-150
        `}
        />
      </div>
    </div>
  );
}

// Enhanced Product Icon Component
function ProductIcon({ icon }: { icon: string }) {
  return (
    <div className="group cursor-default">
      <div
        className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-full shadow-md
        flex items-center justify-center
        transition-all duration-300 ease-out
        group-hover:scale-125 group-hover:shadow-xl
        group-hover:bg-white group-hover:-translate-y-1
        group-hover:rotate-6"
      >
        <span
          className="text-2xl transition-transform duration-300
          group-hover:scale-150 group-hover:rotate-12"
        >
          {icon}
        </span>
      </div>

      {/* Glow Effect */}
      <div
        className="absolute -inset-2 bg-primary/10 rounded-full blur-md opacity-0
        group-hover:opacity-40 transition-opacity duration-300 pointer-events-none"
      />
    </div>
  );
}

function TrustBadge({
  icon,
  text,
}: {
  icon: "truck" | "shield" | "cash";
  text: string;
}) {
  return (
    <div
      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-card rounded-full shadow-sm
      hover:shadow-md transition-all hover:-translate-y-0.5 cursor-default"
    >
      <div
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center
        group-hover:bg-primary/20 transition-colors shrink-0"
      >
        {icon === "truck" && (
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0 m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
        )}
        {icon === "shield" && (
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        )}
        {icon === "cash" && (
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        )}
      </div>
      <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">{text}</span>
    </div>
  );
}

// Mobile Category Button- Touch-friendly navigation buttons for mobile
function MobileCategoryButton({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: string;
  label: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={`
        flex-shrink-0 snap-start
        flex flex-col items-center justify-center
        min-w-[72px] h-[80px] px-3 py-2
        ${color} rounded-xl shadow-sm
        transition-all duration-200
        active:scale-95 active:shadow-md
        hover:shadow-md hover:-translate-y-0.5
      `}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
        {label}
      </span>
    </Link>
  );
}
