"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlogPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    title: string;
    titleEn: string;
    excerpt: string;
    excerptEn: string;
    content: string;
    contentEn: string;
    image: string;
    category: string;
    petType: string;
    published: boolean;
    featured: boolean;
  };
}

export function BlogPreview({ open, onOpenChange, data }: BlogPreviewProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const hasContent = data.title || data.titleEn || data.excerpt || data.excerptEn || data.content || data.contentEn;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {data.published ? "পাবলিশ হওয়া পোস্ট" : "ড্রাফট প্রিভিউ"}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {!hasContent ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>কন্টেন্ট যোগ করুন প্রিভিউ দেখতে</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Preview Badge */}
            {!data.published && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  ⚠️ এটি একটি ড্রাফট প্রিভিউ। পোস্টটি এখনো পাবলিশ হয়নি।
                </p>
              </div>
            )}

            {/* Featured Image */}
            {data.image && (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={data.image}
                  alt={data.title || "Preview"}
                  className="w-full h-full object-cover"
                />
                {data.featured && (
                  <Badge className="absolute top-4 right-4 bg-primary">
                    জনপ্রিয়
                  </Badge>
                )}
              </div>
            )}

            {/* Article Header */}
            <header>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{data.category || "ক্যাটাগরি"}</Badge>
                <Badge variant="outline">{data.petType || "পেট টাইপ"}</Badge>
                {!data.published && (
                  <Badge variant="outline" className="text-muted-foreground">
                    ড্রাফট
                  </Badge>
                )}
              </div>

              {(data.title || data.titleEn) && (
                <h1 className="text-2xl md:text-3xl font-bold mb-4">
                  {data.title || data.titleEn}
                </h1>
              )}

              <div className="text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span>পেটবাজার টিম</span>
                  <span>•</span>
                  <span>{formatDate(new Date())}</span>
                </span>
              </div>
            </header>

            {/* Excerpt */}
            {(data.excerpt || data.excerptEn) && (
              <div className="text-lg text-muted-foreground border-l-4 border-primary pl-4">
                {data.excerpt || data.excerptEn}
              </div>
            )}

            {/* Content */}
            {(data.content || data.contentEn) && (
              <div className="prose prose-lg max-w-none markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold mb-6 mt-8 first:mt-0">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-bold mb-4 mt-6">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-bold mb-3 mt-5">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 leading-relaxed">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic my-4 bg-muted/50 py-2 pr-4 rounded-r">{children}</blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                        <code className="text-sm font-mono">{children}</code>
                      </pre>
                    ),
                    a: ({ children, href }) => (
                      <a href={href} className="text-primary hover:text-primary/80 underline underline-offset-4">
                        {children}
                      </a>
                    ),
                    img: ({ src, alt }) => (
                      <img src={src} alt={alt} className="rounded-lg my-4 max-w-full" />
                    ),
                    hr: () => (
                      <hr className="my-8 border-border" />
                    ),
                  }}
                >
                  {data.content || data.contentEn}
                </ReactMarkdown>
              </div>
            )}

            {!data.content && !data.contentEn && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>কন্টেন্ট লিখুন...</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
