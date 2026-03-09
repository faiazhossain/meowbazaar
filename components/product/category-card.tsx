import Image from "next/image"
import Link from "next/link"

export interface Category {
  id: string
  name: string
  nameEn?: string
  image: string
  href: string
  productCount?: number
}

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={category.href} className="group block">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-muted transition-transform duration-300 group-hover:scale-105 ring-2 ring-transparent group-hover:ring-primary">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="text-center">
          <h3 className="font-medium text-foreground text-sm md:text-base group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          {category.productCount !== undefined && (
            <p className="text-xs text-muted-foreground">
              {category.productCount} পণ্য
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
