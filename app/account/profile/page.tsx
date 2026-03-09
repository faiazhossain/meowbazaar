"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "মোঃ আব্দুল্লাহ",
    phone: "01712345678",
    email: "abdullah@example.com",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleSave = () => {
    // Save profile logic
    setIsEditing(false)
  }

  const handlePasswordChange = () => {
    // Change password logic
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
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
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="flex-1"
            >
              বাতিল
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-primary hover:bg-brand-orange-dark text-primary-foreground"
            >
              সংরক্ষণ করুন
            </Button>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-card rounded-lg p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <h2 className="text-lg font-semibold text-foreground mb-6">পাসওয়ার্ড পরিবর্তন</h2>
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
            !passwordData.currentPassword ||
            !passwordData.newPassword ||
            passwordData.newPassword !== passwordData.confirmPassword
          }
          className="mt-6 bg-primary hover:bg-brand-orange-dark text-primary-foreground"
        >
          পাসওয়ার্ড পরিবর্তন করুন
        </Button>
      </div>
    </div>
  )
}
