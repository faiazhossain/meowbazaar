"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

export function Footer() {
  const { t } = useTranslation();

  const footerLinks = {
    quickLinks: [
      { href: "/about", label: t("footer.aboutUs") },
      { href: "/contact", label: t("footer.contact") },
      { href: "/terms", label: t("footer.terms") },
      { href: "/privacy", label: t("footer.privacy") },
      { href: "/returns", label: t("footer.returns") },
    ],
    petTypes: [
      { href: "/products?pet=cat", label: t("footer.cat") },
      { href: "/products?pet=dog", label: t("footer.dog") },
      { href: "/products?pet=bird", label: t("footer.bird") },
      { href: "/products?pet=fish", label: t("footer.fish") },
      { href: "/products?pet=rabbit", label: t("footer.rabbit") },
    ],
    categories: [
      { href: "/products?category=food", label: t("footer.petFood") },
      { href: "/products?category=toys", label: t("footer.toys") },
      { href: "/products?category=accessories", label: t("footer.accessories") },
      { href: "/products?category=health", label: t("footer.healthSupplies") },
      { href: "/products?category=grooming", label: t("footer.grooming") },
    ],
  };

  return (
    <footer className="bg-foreground text-card">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Brand Section */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <PetLogoWhite />
              <span className="text-xl font-bold text-primary">PetBazaar</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {t("footer.description")}
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Youtube className="h-6 w-6" />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-card">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm py-1 inline-block min-h-[44px] leading-relaxed"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-card">
              {t("footer.pets")}
            </h3>
            <ul className="space-y-3">
              {footerLinks.petTypes.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm py-1 inline-block min-h-[44px] leading-relaxed"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Payment */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-card">{t("footer.contact")}</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+880 1700-000000</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>info@petbazaar.com</span>
                </li>
                <li className="flex items-start gap-2 text-gray-400 text-sm">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Dhaka, Bangladesh</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-card">
                {t("footer.paymentMethods")}
              </h3>
              <div className="flex flex-wrap gap-2">
                <PaymentBadge>COD</PaymentBadge>
                <PaymentBadge>bKash</PaymentBadge>
                <PaymentBadge>Nagad</PaymentBadge>
                <PaymentBadge>Card</PaymentBadge>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} PetBazaar. {t("footer.allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}

function PaymentBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
      {children}
    </span>
  );
}

function PetLogoWhite() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      {/* Paw print logo */}
      <circle cx="16" cy="20" r="8" fill="currentColor" fillOpacity="0.3" />
      <circle cx="10" cy="12" r="3" fill="currentColor" />
      <circle cx="22" cy="12" r="3" fill="currentColor" />
      <circle cx="7" cy="18" r="2.5" fill="currentColor" />
      <circle cx="25" cy="18" r="2.5" fill="currentColor" />
      <ellipse cx="16" cy="22" rx="5" ry="4" fill="currentColor" />
    </svg>
  );
}
