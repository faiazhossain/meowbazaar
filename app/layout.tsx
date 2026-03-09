import type { Metadata, Viewport } from "next";
import { Poppins, Hind_Siliguri } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

export const metadata: Metadata = {
  title: "MeowBazaar | আপনার বিড়ালের জন্য সবকিছু",
  description:
    "বাংলাদেশের সেরা ক্যাট শপ - প্রিমিয়াম ক্যাট ফুড, খেলনা, লিটার ও আরও অনেক কিছু। ঢাকায় হোম ডেলিভারি এবং সারাদেশে ক্যাশ অন ডেলিভারি।",
  keywords: [
    "cat food",
    "cat toys",
    "cat litter",
    "pet shop bangladesh",
    "meowbazaar",
    "ক্যাট ফুড",
    "বিড়ালের খাবার",
  ],
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF8C42",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body
        className={`${poppins.variable} ${hindSiliguri.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
