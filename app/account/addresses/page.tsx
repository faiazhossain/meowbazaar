"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { MapPin, Plus, Edit2, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const divisions = [
  "ঢাকা",
  "চট্টগ্রাম",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "রংপুর",
  "ময়মনসিংহ",
]

interface Address {
  id: string
  label: string
  fullName: string
  phone: string
  division: string
  area: string
  address: string
  isDefault: boolean
}

const initialAddresses: Address[] = [
  {
    id: "1",
    label: "বাসা",
    fullName: "মোঃ আব্দুল্লাহ",
    phone: "01712345678",
    division: "ঢাকা",
    area: "ধানমন্ডি",
    address: "বাড়ি ১২, রোড ৫, ধানমন্ডি ৩২",
    isDefault: true,
  },
  {
    id: "2",
    label: "অফিস",
    fullName: "মোঃ আব্দুল্লাহ",
    phone: "01712345678",
    division: "ঢাকা",
    area: "গুলশান",
    address: "গুলশান অ্যাভিনিউ, গুলশান ১",
    isDefault: false,
  },
]

export default function AddressesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/account/addresses")
      return
    }

    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      router.push("/admin")
      return
    }
  }, [status, router, session?.user?.role])

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    )
  }

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id))
  }

  const handleSave = (address: Omit<Address, "id" | "isDefault">) => {
    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddress.id
            ? { ...addr, ...address }
            : addr
        )
      )
    } else {
      const newAddress: Address = {
        ...address,
        id: Date.now().toString(),
        isDefault: addresses.length === 0,
      }
      setAddresses((prev) => [...prev, newAddress])
    }
    setIsDialogOpen(false)
    setEditingAddress(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">সেভড ঠিকানা</h1>
          <p className="text-muted-foreground">আপনার ডেলিভারি ঠিকানা ম্যানেজ করুন</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingAddress(null)
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-brand-orange-dark text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              নতুন ঠিকানা
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "ঠিকানা এডিট করুন" : "নতুন ঠিকানা যোগ করুন"}
              </DialogTitle>
            </DialogHeader>
            <AddressForm
              address={editingAddress}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingAddress(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-card rounded-lg p-12 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <MapPin className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">কোনো ঠিকানা নেই</h2>
          <p className="text-muted-foreground mb-4">আপনার ডেলিভারি ঠিকানা যোগ করুন</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={cn(
                "bg-card rounded-lg p-4 relative",
                address.isDefault && "ring-2 ring-primary"
              )}
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {address.isDefault && (
                <span className="absolute top-2 right-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                  ডিফল্ট
                </span>
              )}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{address.label}</h3>
                  <p className="text-sm text-foreground">{address.fullName}</p>
                  <p className="text-sm text-muted-foreground">{address.phone}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {address.address}, {address.area}, {address.division}
              </p>
              <div className="flex items-center gap-2">
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    className="gap-1"
                  >
                    <Check className="h-3 w-3" />
                    ডিফল্ট করুন
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAddress(address)
                    setIsDialogOpen(true)
                  }}
                  className="gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  এডিট
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(address.id)}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                  ডিলিট
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface AddressFormProps {
  address: Address | null
  onSave: (address: Omit<Address, "id" | "isDefault">) => void
  onCancel: () => void
}

function AddressForm({ address, onSave, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState({
    label: address?.label || "",
    fullName: address?.fullName || "",
    phone: address?.phone || "",
    division: address?.division || "",
    area: address?.area || "",
    address: address?.address || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="label">ঠিকানার লেবেল</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="যেমন: বাসা, অফিস"
          className="mt-1"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">পূর্ণ নাম</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">ফোন নম্বর</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="mt-1"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="division">বিভাগ</Label>
          <Select
            value={formData.division}
            onValueChange={(value) => setFormData({ ...formData, division: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((div) => (
                <SelectItem key={div} value={div}>
                  {div}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="area">এলাকা</Label>
          <Input
            id="area"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            className="mt-1"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="address">সম্পূর্ণ ঠিকানা</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="mt-1"
          rows={3}
          required
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          বাতিল
        </Button>
        <Button type="submit" className="flex-1 bg-primary hover:bg-brand-orange-dark text-primary-foreground">
          সংরক্ষণ করুন
        </Button>
      </div>
    </form>
  )
}
