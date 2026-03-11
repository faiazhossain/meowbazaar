import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export function Section({ children, className }: SectionProps) {
  return (
    <section className={cn("py-12 md:py-16", className)}>
      <div className="container mx-auto px-4">{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkText?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  href,
  linkText = "সব দেখুন",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-8", className)}>
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {title}
        </h2>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-brand-orange-dark transition-colors"
        >
          {linkText}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

interface ProductGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ProductGrid({ children, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        "gap-3 sm:gap-4 md:gap-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CategoryGridProps {
  children: React.ReactNode;
  className?: string;
}

export function CategoryGrid({ children, className }: CategoryGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6",
        "gap-4 sm:gap-6",
        className
      )}
    >
      {children}
    </div>
  );
}
