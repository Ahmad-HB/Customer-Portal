"use client"

import { useState, useEffect } from "react"
import { User, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RoleBasedAccess } from "@/components/RoleBasedAccess"
import { useAuth } from "@/contexts/AuthContext"
import { useCurrentUserRole } from "@/hooks/useAbpApi"

export default function SupportProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const { role: currentRole, isLoading: roleLoading, isSupportAgent } = useCurrentUserRole()
  
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    role: ""
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (user && currentRole && !roleLoading) {
      setFormData({
        username: user.username || "",
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: currentRole || ""
      })
    }
  }, [user, currentRole, roleLoading])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage("")
    
    try {
      // TODO: Implement profile update API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setMessage("Profile updated successfully!")
      setIsEditing(false)
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original values
    if (user && currentRole) {
      setFormData({
        username: user.username || "",
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: currentRole || ""
      })
    }
    setIsEditing(false)
    setMessage("")
  }

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleBasedAccess allowedRoles={[3]} fallback={<div>Access Denied</div>}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-muted-foreground">Manage your support agent profile and settings</p>
          </div>
          <Badge variant="outline" className="text-sm">
            Support Agent
          </Badge>
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{formData.name || "Support Agent"}</h2>
                <p className="text-muted-foreground">{formData.role || "Support Agent"}</p>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-md mb-6 ${
                message.includes("successfully") 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  value={formData.role}
                  disabled
                  className="bg-gray-100 text-gray-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Support Agent Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Support Agent Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Permissions</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• View assigned tickets</li>
                  <li>• Submit ticket reports</li>
                  <li>• Assign ticket priorities</li>
                  <li>• Access customer information</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Responsibilities</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Monitor ticket status</li>
                  <li>• Provide customer support</li>
                  <li>• Escalate critical issues</li>
                  <li>• Maintain ticket documentation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedAccess>
  )
}
