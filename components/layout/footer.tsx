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
  categories: [
    { href: "/products?category=food", label: "ক্যাট ফুড" },
    { href: "/products?category=toys", label: "খেলনা" },
    { href: "/products?category=litter", label: "লিটার" },
    { href: "/products?category=accessories", label: "এক্সেসরিজ" },
    { href: "/products?category=health", label: "স্বাস্থ্য সামগ্রী" },
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
              <CatLogoWhite />
              <span className="text-xl font-bold text-primary">MeowBazaar</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              বাংলাদেশের সবচেয়ে বড় ক্যাট শপ। আমরা আপনার প্রিয় বিড়ালের জন্য সেরা মানের পণ্য সরবরাহ করি।
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
            <h3 className="text-lg font-semibold mb-4 text-card">ক্যাটাগরি</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
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
                  <span>info@meowbazaar.com</span>
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
            © {new Date().getFullYear()} MeowBazaar. সর্বস্বত্ব সংরক্ষিত।
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

function CatLogoWhite() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M8 12L6 4L12 8M24 12L26 4L20 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="14" r="2" fill="currentColor" />
      <circle cx="20" cy="14" r="2" fill="currentColor" />
      <path
        d="M16 18C16 18 14 20 12 20M16 18C16 18 18 20 20 20M16 18V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 22C12 24 14 25 16 25C18 25 20 24 22 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
