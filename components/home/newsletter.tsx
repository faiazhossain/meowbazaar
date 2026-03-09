"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    setIsSubmitted(true)
    setEmail("")
  }

  return (
    <section className="py-12 md:py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            আমাদের নিউজলেটার সাবস্ক্রাইব করুন
          </h2>
          <p className="text-muted-foreground mb-6">
            নতুন পণ্য, অফার এবং ক্যাট কেয়ার টিপস পেতে সাবস্ক্রাইব করুন
          </p>

          {isSubmitted ? (
            <div className="p-4 bg-success/10 rounded-lg text-success">
              ধন্যবাদ! আপনি সফলভাবে সাবস্ক্রাইব করেছেন।
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="আপনার ইমেইল দিন"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-card border-border"
              />
              <Button 
                type="submit" 
                className="bg-primary hover:bg-brand-orange-dark text-primary-foreground shrink-0"
              >
                সাবস্ক্রাইব
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
