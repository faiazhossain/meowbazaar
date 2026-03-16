import { getActiveFAQs } from "@/lib/actions/faq";
import { FAQAccordion } from "@/components/support/faq-accordion";
import { HelpCircle } from "lucide-react";

export default async function FAQPage() {
  const faqs = await getActiveFAQs();

  // Get unique categories
  const categories = [...new Set(faqs.filter((f) => f.category).map((f) => f.category))];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground">
            Find answers to common questions about PetBazaar
          </p>
        </div>

        {/* FAQs by Category */}
        {categories.length > 0 ? (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  {category}
                </h2>
                <FAQAccordion faqs={faqs} category={category} />
              </div>
            ))}

            {/* Uncategorized FAQs */}
            {faqs.some((f) => !f.category) && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  General
                </h2>
                <FAQAccordion faqs={faqs.filter((f) => !f.category)} />
              </div>
            )}
          </div>
        ) : (
          <FAQAccordion faqs={faqs} />
        )}

        {/* Contact CTA */}
        <div className="mt-12 text-center p-6 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
