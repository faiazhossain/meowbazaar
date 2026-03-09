import Link from "next/link"
import { Button } from "@/components/ui/button"

interface OfferBannerProps {
  title: string
  description?: string
  ctaText: string
  ctaHref: string
  variant?: "primary" | "accent"
}

export function OfferBanner({ 
  title, 
  description, 
  ctaText, 
  ctaHref,
  variant = "primary" 
}: OfferBannerProps) {
  const bgClass = variant === "primary" 
    ? "bg-gradient-to-r from-primary to-brand-orange-dark" 
    : "bg-gradient-to-r from-accent to-mint"

  return (
    <section className={`${bgClass} py-10 md:py-14`}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3 text-balance">
          {title}
        </h2>
        {description && (
          <p className="text-primary-foreground/90 text-lg mb-6 max-w-2xl mx-auto text-pretty">
            {description}
          </p>
        )}
        <Link href={ctaHref}>
          <Button 
            size="lg" 
            className={
              variant === "primary"
                ? "bg-card text-primary hover:bg-card/90"
                : "bg-card text-accent hover:bg-card/90"
            }
          >
            {ctaText}
          </Button>
        </Link>
      </div>
    </section>
  )
}
