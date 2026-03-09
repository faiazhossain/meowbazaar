import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream via-brand-orange-light/20 to-cream">
      <div className="container mx-auto px-4 py-12 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight text-balance">
              আপনার বিড়ালের জন্য সবকিছু এক জায়গায়
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 text-pretty">
              প্রিমিয়াম ক্যাট ফুড, খেলনা, লিটার ও আরও অনেক কিছু। সারাদেশে ক্যাশ অন ডেলিভারি।
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/products">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-brand-orange-dark text-primary-foreground px-8"
                >
                  শপিং শুরু করুন
                </Button>
              </Link>
              <Link href="/products?category=food">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/5 px-8"
                >
                  ক্যাট ফুড দেখুন
                </Button>
              </Link>
            </div>
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
              <TrustBadge icon="truck" text="সারাদেশে ডেলিভারি" />
              <TrustBadge icon="shield" text="১০০% অরিজিনাল" />
              <TrustBadge icon="cash" text="ক্যাশ অন ডেলিভারি" />
            </div>
          </div>

          {/* Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <CatIllustration />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
    </section>
  )
}

function TrustBadge({ icon, text }: { icon: "truck" | "shield" | "cash"; text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-full shadow-sm">
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
        {icon === "truck" && (
          <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        )}
        {icon === "shield" && (
          <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )}
        {icon === "cash" && (
          <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )}
      </div>
      <span className="text-xs font-medium text-foreground">{text}</span>
    </div>
  )
}

function CatIllustration() {
  return (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background Circle */}
      <circle cx="200" cy="200" r="180" fill="#FF8C42" fillOpacity="0.1" />
      
      {/* Cat Body */}
      <ellipse cx="200" cy="280" rx="100" ry="80" fill="#FF8C42" />
      
      {/* Cat Head */}
      <circle cx="200" cy="160" r="90" fill="#FF8C42" />
      
      {/* Cat Ears */}
      <path d="M120 100L100 40L160 80Z" fill="#FF8C42" />
      <path d="M280 100L300 40L240 80Z" fill="#FF8C42" />
      <path d="M125 95L115 55L155 85Z" fill="#FFB466" />
      <path d="M275 95L285 55L245 85Z" fill="#FFB466" />
      
      {/* Eyes */}
      <ellipse cx="160" cy="150" rx="20" ry="25" fill="white" />
      <ellipse cx="240" cy="150" rx="20" ry="25" fill="white" />
      <circle cx="165" cy="155" r="12" fill="#212121" />
      <circle cx="245" cy="155" r="12" fill="#212121" />
      <circle cx="168" cy="150" r="4" fill="white" />
      <circle cx="248" cy="150" r="4" fill="white" />
      
      {/* Nose */}
      <path d="M200 180L190 195L210 195Z" fill="#E67A2E" />
      
      {/* Mouth */}
      <path d="M200 195C200 195 185 210 175 210" stroke="#E67A2E" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M200 195C200 195 215 210 225 210" stroke="#E67A2E" strokeWidth="3" strokeLinecap="round" fill="none" />
      
      {/* Whiskers */}
      <line x1="130" y1="180" x2="80" y2="170" stroke="#E67A2E" strokeWidth="2" strokeLinecap="round" />
      <line x1="130" y1="190" x2="80" y2="190" stroke="#E67A2E" strokeWidth="2" strokeLinecap="round" />
      <line x1="130" y1="200" x2="80" y2="210" stroke="#E67A2E" strokeWidth="2" strokeLinecap="round" />
      <line x1="270" y1="180" x2="320" y2="170" stroke="#E67A2E" strokeWidth="2" strokeLinecap="round" />
      <line x1="270" y1="190" x2="320" y2="190" stroke="#E67A2E" strokeWidth="2" strokeLinecap="round" />
      <line x1="270" y1="200" x2="320" y2="210" stroke="#E67A2E" strokeWidth="2" strokeLinecap="round" />
      
      {/* Paws */}
      <ellipse cx="140" cy="340" rx="30" ry="20" fill="#FFB466" />
      <ellipse cx="260" cy="340" rx="30" ry="20" fill="#FFB466" />
      
      {/* Tail */}
      <path d="M300 280C330 260 350 300 340 340" stroke="#FF8C42" strokeWidth="20" strokeLinecap="round" fill="none" />
      
      {/* Collar */}
      <path d="M140 240C140 240 170 260 200 260C230 260 260 240 260 240" stroke="#4ECDC4" strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx="200" cy="265" r="10" fill="#4ECDC4" />
    </svg>
  )
}
