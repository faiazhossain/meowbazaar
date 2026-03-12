"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

interface BlogPost {
  id: string;
  title: string;
  titleEn?: string;
  excerpt: string;
  excerptEn?: string;
  image: string;
  href: string;
  date: string;
  dateEn?: string;
}

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const { locale } = useTranslation();
  const { t } = useTranslation();

  const title = locale === "en" && post.titleEn ? post.titleEn : post.title;
  const excerpt = locale === "en" && post.excerptEn ? post.excerptEn : post.excerpt;
  const date = locale === "en" && post.dateEn ? post.dateEn : post.date;

  return (
    <Link href={post.href} className="group block">
      <article
        className="bg-card rounded-lg overflow-hidden transition-shadow hover:shadow-lg active:shadow-md"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={post.image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            {date}
          </p>
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base leading-snug">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {excerpt}
          </p>
          <span className="inline-flex items-center text-sm font-medium text-primary group-hover:text-brand-orange-dark min-h-[44px] py-2">
            {t("blog.readMore")}
            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </article>
    </Link>
  );
}
