import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  image: string
  href: string
  date: string
}

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={post.href} className="group block">
      <article className="bg-card rounded-lg overflow-hidden transition-shadow hover:shadow-lg" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-3 sm:p-4">
          <p className="text-xs text-muted-foreground mb-1 sm:mb-2">{post.date}</p>
          <h3 className="font-semibold text-sm sm:text-base text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
            {post.excerpt}
          </p>
          <span className="inline-flex items-center text-sm font-medium text-primary group-hover:text-brand-orange-dark">
            আরও পড়ুন
            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </article>
    </Link>
  )
}
