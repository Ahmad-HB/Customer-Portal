"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Shield, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    phone: "",
    role: "",
    concurrencyStamp: "",
  })

  const [originalData, setOriginalData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    phone: "",
    role: "",
    concurrencyStamp: "",
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize with real user data from backend
  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || "",
        surname: "", // Backend doesn't seem to have surname
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        concurrencyStamp: (user as any).concurrencyStamp || "",
      }
      setFormData(userData)
      setOriginalData(userData)
    }
  }, [user])

  // Check for changes whenever formData changes
  useEffect(() => {
    const changed = Object.keys(formData).some(key => 
      formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData]
    )
    setHasChanges(changed)
  }, [formData, originalData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Don't allow changes to the role field
    if (e.target.name === 'role') return
    
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleEdit = async () => {
    setIsLoading(true)
    
    try {
      const success = await updateUser({
        username: formData.username,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        surname: formData.surname,
        concurrencyStamp: formData.concurrencyStamp
      } as any)
      
      if (success) {
        // Refresh the page after successful update to ensure clean state
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (err) {
      console.error('Failed to update profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    console.log("Cancel changes")
    setFormData(originalData)
    setHasChanges(false)
  }

  return (
    <div className="p-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left side - Avatar */}
        <div className="flex justify-center lg:justify-start">
          <Card className="flex h-80 w-80 items-center justify-center bg-card">
            <User className="h-20 w-20 text-muted-foreground" />
          </Card>
        </div>

        {/* Right side - Form */}
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name || ""} 
                onChange={handleChange} 
                className="rounded-full" 
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">Surname</Label>
              <Input
                id="surname"
                name="surname"
                value={formData.surname || ""}
                onChange={handleChange}
                className="rounded-full"
                placeholder="Enter your surname (optional)"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">User name</Label>
              <Input
                id="username"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                className="rounded-full"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="rounded-full"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={handleChange}
                className="rounded-full"
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </Label>
              <Input
                id="role"
                name="role"
                value={formData.role || ""}
                disabled
                className="rounded-full bg-gray-100 cursor-not-allowed text-gray-700 font-medium"
                placeholder="Your role will be displayed here"
              />
              <p className="text-xs text-muted-foreground">This field shows your current role and cannot be edited</p>
            </div>
          </div>

          {/* Action Buttons - Only show when there are changes, positioned under form fields */}
          {hasChanges && (
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleEdit}
                disabled={isLoading}
                size="sm"
                className="rounded-full bg-green-500 hover:bg-green-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isLoading}
                variant="destructive"
                size="sm"
                className="rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}