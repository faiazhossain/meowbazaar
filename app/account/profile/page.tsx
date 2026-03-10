"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getProfile, updateProfile, changePassword } from "@/lib/actions/profile"
import { CatLoader } from "@/components/ui/cat-loader"

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  createdAt: Date
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [originalData, setOriginalData] = useState({
    fullName: "",
    phone: "",
    email: "",
  })
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/account/profile")
      return
    }

    if (status === "authenticated") {
      fetchProfile()
    }
  }, [status, router])

  async function fetchProfile() {
    try {
      const profile = await getProfile() as UserProfile | null
      if (profile) {
        const data = {
          fullName: profile.name || "",
          phone: profile.phone || "",
          email: profile.email || "",
        }
        setOriginalData(data)
        setFormData(data)
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError("প্রোফাইল লোড করা যায়নি")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(originalData)
    setIsEditing(false)
    setError(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updateProfile({
        name: formData.fullName,
        phone: formData.phone,
      })

      if (result.success) {
        setOriginalData(formData)
        setIsEditing(false)
        setSuccess("প্রোফাইল সফলভাবে আপডেট হয়েছে")
        router.refresh()
      } else {
        setError(result.error || "প্রোফাইল আপডেট করা যায়নি")
      }
    } catch (err) {
      console.error("Error saving profile:", err)
      setError("কিছু ভুল হয়েছে")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("নতুন পাসওয়ার্ড মিলছে না")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে")
      return
    }

    setIsChangingPassword(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      )

      if (result.success) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        setPasswordSuccess("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে")
      } else {
        setPasswordError(result.error || "পাসওয়ার্ড পরিবর্তন করা যায়নি")
      }
    } catch (err) {
      console.error("Error changing password:", err)
      setPasswordError("কিছু ভুল হয়েছে")
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <CatLoader text="প্রোফাইল লোড হচ্ছে..." size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">প্রোফাইল</h1>
        <p className="text-muted-foreground">আপনার প্রোফাইল তথ্য আপডেট করুন</p>
      </div>

      {/* Profile Info */}
      <div className="bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">ব্যক্তিগত তথ্য</h2>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              এডিট করুন
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-success/10 text-success text-sm">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">পূর্ণ নাম</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">ফোন নম্বর</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">ইমেইল</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="mt-1 bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">ইমেইল পরিবর্তন করা যাবে না</p>
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1"
            >
              বাতিল
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-primary hover:bg-brand-orange-dark text-primary-foreground"
            >
              {isSaving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <h2 className="text-lg font-semibold text-foreground mb-6">পাসওয়ার্ড পরিবর্তন</h2>

        {passwordError && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-success/10 text-success text-sm">
            {passwordSuccess}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">বর্তমান পাসওয়ার্ড</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">নতুন পাসওয়ার্ড নিশ্চিত করুন</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              className="mt-1"
            />
          </div>
        </div>
        <Button
          onClick={handlePasswordChange}
          disabled={
            isChangingPassword ||
            !passwordData.currentPassword ||
            !passwordData.newPassword ||
            passwordData.newPassword !== passwordData.confirmPassword
          }
          className="mt-6 bg-primary hover:bg-brand-orange-dark text-primary-foreground"
        >
          {isChangingPassword ? "পরিবর্তন হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}
        </Button>
      </div>
    </div>
  )
}
