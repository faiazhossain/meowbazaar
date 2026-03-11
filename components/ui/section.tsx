import Link from "next/link"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface SectionProps {
  children: React.ReactNode
  className?: string
}

export function Section({ children, className }: SectionProps) {
  return (
    <section className={cn("py-8 md:py-12 lg:py-16", className)}>
      <div className="container mx-auto px-3 sm:px-4">{children}</div>
    </section>
  )
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  href?: string
  linkText?: string
  className?: string
}

export function SectionHeader({ title, subtitle, href, linkText = "সব দেখুন", className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8", className)}>
      <div className="flex-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs sm:text-sm font-medium text-primary hover:text-brand-orange-dark transition-colors whitespace-nowrap"
        >
          {linkText}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

interface ProductGridProps {
  children: React.ReactNode
  className?: string
}

export function ProductGrid({ children, className }: ProductGridProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6", className)}>
      {children}
    </div>
  )
}

interface CategoryGridProps {
  children: React.ReactNode
  className?: string
}

export function CategoryGrid({ children, className }: CategoryGridProps) {
  return (
    <div className={cn("grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6", className)}>
      {children}
    </div>
  )
}
