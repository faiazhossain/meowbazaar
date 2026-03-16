"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/lib/actions/contact";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const { t, locale } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitContactForm(formData);

      if (result.success) {
        toast.success(
          locale === "en"
            ? "Your message has been sent successfully!"
            : "আপনার বার্তা সফলভাবে পাঠানো হয়েছে!"
        );
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(result.error || (locale === "en" ? "Failed to send message" : "বার্তা পাঠাতে ব্যর্থ হয়েছে"));
      }
    } catch (error) {
      toast.error(locale === "en" ? "Something went wrong" : "কিছু ভুল হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {locale === "en" ? "Contact Us" : "যোগাযোগ করুন"}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === "en"
              ? "Have questions or need help? We're here to assist you. Reach out to us through any of the channels below."
              : "প্রশ্ন আছে বা সাহায্য দরকার? আমরা আপনাকে সাহায্য করতে এখানে আছি। নিচের যেকোনো মাধ্যমে আমাদের সাথে যোগাযোগ করুন।"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {locale === "en" ? "Phone" : "ফোন"}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    +880 1700-000000
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {locale === "en" ? "Sat-Thu, 9AM-6PM" : "শনি-বৃহস্পতি, সকাল ৯টা-সন্ধ্যা ৬টা"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {locale === "en" ? "Email" : "ইমেইল"}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    info@petbazaar.com
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {locale === "en" ? "We reply within 24 hours" : "আমরা ২৪ ঘন্টার মধ্যে উত্তর দিই"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {locale === "en" ? "Location" : "অবস্থান"}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {locale === "en" ? "Dhaka, Bangladesh" : "ঢাকা, বাংলাদেশ"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-lg p-6 border border-border space-y-6"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    {locale === "en" ? "Full Name *" : "পূর্ণ নাম *"}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={locale === "en" ? "Your name" : "আপনার নাম"}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">
                    {locale === "en" ? "Email *" : "ইমেইল *"}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder={locale === "en" ? "your@email.com" : "your@email.com"}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">
                    {locale === "en" ? "Phone (Optional)" : "ফোন (ঐচ্ছিক)"}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="01XXXXXXXXX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">
                    {locale === "en" ? "Subject" : "বিষয়"}
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder={locale === "en" ? "How can we help?" : "আমরা কীভাবে সাহায্য করতে পারি?"}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">
                  {locale === "en" ? "Message *" : "বার্তা *"}
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder={
                    locale === "en"
                      ? "Tell us how we can help you..."
                      : "আমাদের জানান কীভাবে আমরা আপনাকে সাহায্য করতে পারি..."
                  }
                  required
                  rows={5}
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {locale === "en" ? "Sending..." : "পাঠানো হচ্ছে..."}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {locale === "en" ? "Send Message" : "বার্তা পাঠান"}
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
