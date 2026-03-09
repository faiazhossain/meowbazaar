import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function CODBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success text-success-foreground",
        className
      )}
    >
      COD
    </span>
  )
}

export function DiscountBadge({ percentage, className }: { percentage: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive text-destructive-foreground",
        className
      )}
    >
      {percentage}% ছাড়
    </span>
  )
}

export function NewBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground",
        className
      )}
    >
      নতুন
    </span>
  )
}

export function StockBadge({ inStock, className }: { inStock: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        inStock 
          ? "bg-success/10 text-success" 
          : "bg-destructive/10 text-destructive",
        className
      )}
    >
      {inStock ? "স্টকে আছে" : "স্টক শেষ"}
    </span>
  )
}

export function CategoryBadge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  )
}

export function OrderStatusBadge({ 
  status 
}: { 
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" 
}) {
  const statusConfig = {
    pending: { label: "পেন্ডিং", className: "bg-amber-100 text-amber-700" },
    confirmed: { label: "নিশ্চিত", className: "bg-blue-100 text-blue-700" },
    shipped: { label: "শিপড", className: "bg-purple-100 text-purple-700" },
    delivered: { label: "ডেলিভারড", className: "bg-success/10 text-success" },
    cancelled: { label: "বাতিল", className: "bg-destructive/10 text-destructive" },
  }

  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
