"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import "../styles/footer.css";
import {
  Facebook,
  Instagram,
  Youtube,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Heart,
  Shield,
  Truck,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

export function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const footerLinks = {
    quickLinks: [
      { href: "/about", label: t("footer.aboutUs"), icon: Heart },
      { href: "/contact", label: t("footer.contact"), icon: Mail },
      { href: "/terms", label: t("footer.terms"), icon: Shield },
      { href: "/privacy", label: t("footer.privacy"), icon: Shield },
      { href: "/returns", label: t("footer.returns"), icon: RefreshCw },
    ],
  };

  const features = [
    { icon: Truck, label: "Free Shipping", sublabel: "On orders over $50" },
    {
      icon: RefreshCw,
      label: "Easy Returns",
      sublabel: "30-day return policy",
    },
    {
      icon: Shield,
      label: "Secure Payment",
      sublabel: "100% secure transactions",
    },
    { icon: Heart, label: "Pet Love", sublabel: "Quality guaranteed" },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribe:", email);
    setEmail("");
    // Show success message
  };

  const getHoverClass = (baseClass: string) => {
    return isMobile
      ? baseClass
      : `${baseClass} hover:bg-orange-500/20 hover:text-orange-500`;
  };

  return (
    <footer className="bg-black text-gray-300 border-t border-orange-500/20">
      {/* Features Bar */}
      <div className="border-b border-orange-500/20 bg-black/95">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 ${!isMobile && "group cursor-pointer"}`}
                >
                  <div className="relative">
                    <div
                      className={`absolute inset-0 bg-orange-500/20 rounded-full blur-md ${!isMobile && "group-hover:bg-orange-500/30"} transition-all`}
                    />
                    <div
                      className={`relative bg-orange-500/10 p-2.5 rounded-full ${!isMobile && "group-hover:bg-orange-500/20"} transition-all`}
                    >
                      <Icon className="h-5 w-5 text-orange-500" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">
                      {feature.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {feature.sublabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section - Larger on mobile */}
          <div className="md:col-span-2 lg:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div
                  className={`absolute inset-0 bg-orange-500/20 rounded-xl blur-lg ${!isMobile && "group-hover:bg-orange-500/30"} transition-all`}
                />
                <PetLogo className="relative w-12 h-12 text-orange-500" />
              </div>
              <div>
                <span className="text-2xl font-bold text-orange-500">
                  PetBazaar
                </span>
                <span className="block text-xs text-gray-400">
                  Your pet&apos;s happy place
                </span>
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              {t("footer.description")}
            </p>

          <style jsx>{`
            .prevent-auto-link span {
              pointer-events: none;
            }
          `}</style>

            {/* Newsletter Signup */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white">
                Subscribe to our newsletter
              </h4>
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  required
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-3 sm:py-2.5 bg-orange-500 text-black font-medium rounded-lg text-sm transition-all active:scale-95 shadow-lg shadow-orange-500/25 hover:bg-orange-400"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">
                Follow us
              </h4>
              <div className="flex gap-3">
                {[
                  {
                    Icon: Facebook,
                    href: "https://facebook.com",
                    label: "Facebook",
                  },
                  {
                    Icon: Instagram,
                    href: "https://instagram.com",
                    label: "Instagram",
                  },
                  {
                    Icon: Youtube,
                    href: "https://youtube.com",
                    label: "YouTube",
                  },
                ].map((social) => {
                  const Icon = social.Icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`relative ${!isMobile && "group"}`}
                      aria-label={social.label}
                    >
                      <div
                        className={`absolute inset-0 bg-orange-500/20 rounded-full blur-md ${!isMobile && "group-hover:bg-orange-500/30"} transition-all`}
                      />
                      <div
                        className={`relative bg-gray-900 p-3 rounded-full border border-gray-800 ${!isMobile && "group-hover:border-orange-500 group-hover:text-orange-500"} transition-all active:scale-95`}
                      >
                        <Icon className="h-4 w-4 text-orange-500" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center gap-2 text-gray-400 ${!isMobile && "hover:text-orange-500"} transition-all active:text-orange-500`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="text-sm">{link.label}</span>
                      {!isMobile && (
                        <ChevronRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-orange-500/10 p-2 rounded-lg">
                  <Phone className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Call us</span>
                  <a
                    href="tel:+8801700000000"
                    className={`text-sm text-white ${!isMobile && "hover:text-orange-500"} transition-colors active:text-orange-500`}
                  >
                    +880 1700-000000
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-orange-500/10 p-2 rounded-lg">
                  <Mail className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Email us</span>
                  <a
                    href="mailto:info@petbazaar.com"
                    className={`text-sm text-white ${!isMobile && "hover:text-orange-500"} transition-colors active:text-orange-500`}
                  >
                    info@petbazaar.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-orange-500/10 p-2 rounded-lg">
                  <MapPin className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Visit us</span>
                  <span className="text-sm text-white">Dhaka, Bangladesh</span>
                </div>
              </li>
            </ul>

            {/* Payment Methods */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-3">
                We accept
              </h4>
              <div className="flex flex-wrap gap-2">
                {["COD", "bKash", "Nagad", "Visa", "Mastercard"].map(
                  (method) => (
                    <span
                      key={method}
                      className={`px-3 py-1.5 bg-gray-900 border border-gray-800 text-gray-300 text-xs rounded-lg ${!isMobile && "hover:border-orange-500 hover:text-orange-500"} transition-all cursor-default active:border-orange-500 active:text-orange-500`}
                    >
                      {method}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-orange-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 order-2 md:order-1">
              &copy; {new Date().getFullYear()} PetBazaar.{" "}
              {t("footer.allRightsReserved")}
            </p>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 order-1 md:order-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-gray-400">Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-gray-400">Pet Friendly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PetLogo({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="20" r="8" fill="currentColor" fillOpacity="0.2" />
      <circle cx="10" cy="12" r="3.5" fill="currentColor" />
      <circle cx="22" cy="12" r="3.5" fill="currentColor" />
      <circle cx="7" cy="18" r="3" fill="currentColor" />
      <circle cx="25" cy="18" r="3" fill="currentColor" />
      <ellipse cx="16" cy="22" rx="6" ry="4.5" fill="currentColor" />
    </svg>
  );
}
