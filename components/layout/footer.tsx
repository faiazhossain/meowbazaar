import Link from "next/link"
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react"

const footerLinks = {
  quickLinks: [
    { href: "/about", label: "আমাদের সম্পর্কে" },
    { href: "/contact", label: "যোগাযোগ" },
    { href: "/terms", label: "শর্তাবলী" },
    { href: "/privacy", label: "গোপনীয়তা নীতি" },
    { href: "/returns", label: "রিটার্ন পলিসি" },
  ],
  petTypes: [
    { href: "/products?pet=cat", label: "বিড়াল" },
    { href: "/products?pet=dog", label: "কুকুর" },
    { href: "/products?pet=bird", label: "পাখি" },
    { href: "/products?pet=fish", label: "মাছ" },
    { href: "/products?pet=rabbit", label: "খরগোশ" },
  ],
  categories: [
    { href: "/products?category=food", label: "পেট ফুড" },
    { href: "/products?category=toys", label: "খেলনা" },
    { href: "/products?category=accessories", label: "এক্সেসরিজ" },
    { href: "/products?category=health", label: "স্বাস্থ্য সামগ্রী" },
    { href: "/products?category=grooming", label: "গ্রুমিং" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-foreground text-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <PetLogoWhite />
              <span className="text-xl font-bold text-primary">PetBazaar</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              বাংলাদেশের সবচেয়ে বড় পেট শপ। বিড়াল, কুকুর, পাখি, মাছ ও অন্যান্য পোষা প্রাণীর জন্য সেরা মানের পণ্য সরবরাহ করি।
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-card">দ্রুত লিঙ্ক</h3>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-card">পোষা প্রাণী</h3>
            <ul className="space-y-2">
              {footerLinks.petTypes.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
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
              <h3 className="text-lg font-semibold mb-4 text-card">যোগাযোগ</h3>
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
                  <span>ঢাকা, বাংলাদেশ</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-card">পেমেন্ট পদ্ধতি</h3>
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
            © {new Date().getFullYear()} PetBazaar. সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  )
}

function PaymentBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
      {children}
    </span>
  )
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
  )
}
