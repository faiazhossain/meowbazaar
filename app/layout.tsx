import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Poppins, Hind_Siliguri } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/auth-provider";
import { NavigationProgressProvider } from "@/components/navigation-progress";
import { Toaster } from "@/components/ui/sonner";
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
  title: "PetBazaar | আপনার পোষা প্রাণীর সবকিছু",
  description:
    "বাংলাদেশের সেরা পেট শপ - বিড়াল, কুকুর, পাখি ও মাছের জন্য প্রিমিয়াম খাবার, খেলনা ও এক্সেসরিজ। ঢাকায় হোম ডেলিভারি এবং সারাদেশে ক্যাশ অন ডেলিভারি।",
  keywords: [
    "pet food",
    "cat food",
    "dog food",
    "bird food",
    "fish food",
    "pet toys",
    "pet shop bangladesh",
    "petbazaar",
    "পেট ফুড",
    "পোষা প্রাণীর খাবার",
    "কুকুরের খাবার",
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
        <AuthProvider>
          <Suspense fallback={null}>
            <NavigationProgressProvider>{children}</NavigationProgressProvider>
          </Suspense>
        </AuthProvider>
        <Toaster position="top-center" richColors closeButton />
        <Analytics />
      </body>
    </html>
  );
}
