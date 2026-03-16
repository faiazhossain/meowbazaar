"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/use-translation";

interface FAQ {
  id: string;
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
  category?: string | null;
}

interface FAQAccordionProps {
  faqs: FAQ[];
  category?: string;
}

export function FAQAccordion({ faqs, category }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { locale } = useTranslation();

  const filteredFaqs = category
    ? faqs.filter((faq) => faq.category === category)
    : faqs;

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  if (filteredFaqs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No FAQs available in this category.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredFaqs.map((faq) => {
        const isOpen = openId === faq.id;
        const question = locale === "en" ? faq.questionEn : faq.question;
        const answer = locale === "en" ? faq.answerEn : faq.answer;

        return (
          <div
            key={faq.id}
            className="bg-card rounded-lg border border-border overflow-hidden"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <button
              onClick={() => toggleItem(faq.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-foreground pr-4">
                {question}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                isOpen ? "max-h-96" : "max-h-0"
              )}
            >
              <div className="p-4 pt-0 text-muted-foreground border-t border-border">
                <div className="pt-4 whitespace-pre-wrap">{answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
