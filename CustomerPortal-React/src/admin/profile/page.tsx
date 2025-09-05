"use client"

import { useState, useEffect } from "react"
import { User, Mail, Phone, Shield, Camera, Save, Edit, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RoleBasedAccess } from "@/components/RoleBasedAccess"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api-client"
import { ColorScheme } from "@/lib/color-scheme"

export default function AdminProfilePage() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    department: "",
    bio: "",
    location: "",
    timezone: "",
    language: ""
  })

  // Initialize with real user data from backend
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.name || "",
        lastName: "", // Backend doesn't seem to have lastName
        email: user.email || "",
        phone: user.phone || "",
        title: "System Administrator", // Default for admin
        department: "IT", // Default for admin
        bio: "Experienced system administrator with expertise in customer support systems and user management.",
        location: "New York, NY",
        timezone: "Eastern Time (ET)",
        language: "English"
      })
    }
  }, [user])

  const handleProfileChange = (key: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // Update profile via API
      const response = await apiClient.updateUser({
        name: profile.firstName,
        email: profile.email,
        phone: profile.phone
      })

      if (response.success) {
        // Update the user context with new data
        updateUser({
          ...user,
          name: profile.firstName,
          email: profile.email,
          phone: profile.phone
        })
        
        setSuccess("Profile updated successfully!")
        setIsEditing(false)
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(response.message || "Failed to update profile")
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values from user data
    if (user) {
      setProfile({
        firstName: user.name || "",
        lastName: "", // Backend doesn't seem to have lastName
        email: user.email || "",
        phone: user.phone || "",
        title: "System Administrator", // Default for admin
        department: "IT", // Default for admin
        bio: "Experienced system administrator with expertise in customer support systems and user management.",
        location: "New York, NY",
        timezone: "Eastern Time (ET)",
        language: "English"
      })
    }
    setError("")
    setSuccess("")
    setIsEditing(false)
  }

  return (
    <RoleBasedAccess allowedRoles={[1]} fallback={<div>Access Denied</div>}>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-4 ${ColorScheme.alerts.error.bg} border ${ColorScheme.alerts.error.border} rounded-lg`}>
            <p className={`${ColorScheme.alerts.error.text} text-sm`}>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className={`p-4 ${ColorScheme.alerts.success.bg} border ${ColorScheme.alerts.success.border} rounded-lg`}>
            <p className={`${ColorScheme.alerts.success.text} text-sm`}>{success}</p>
          </div>
        )}

        {/* Profile Overview */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto w-32 h-32 mb-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="text-4xl">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardTitle className="text-2xl">{profile.firstName} {profile.lastName}</CardTitle>
                <CardDescription>{profile.title}</CardDescription>
                <div className="flex justify-center mt-4">
                  <Badge variant="secondary" className="text-sm">
                    <Shield className="mr-1 h-3 w-3" />
                    Administrator
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.department}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      value={profile.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      value={profile.lastName}
                      onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    disabled={!isEditing || isLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={profile.title}
                      onChange={(e) => handleProfileChange('title', e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={profile.department}
                      onChange={(e) => handleProfileChange('department', e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role
                  </Label>
                  <Input
                    id="role"
                    value={user?.role || ""}
                    disabled
                    className="bg-gray-100 cursor-not-allowed text-gray-700 font-medium"
                    placeholder="Your role will be displayed here"
                  />
                  <p className="text-xs text-muted-foreground">This field shows your current role and cannot be edited</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Manage your contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    disabled={!isEditing || isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    disabled={!isEditing || isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    disabled={!isEditing || isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Set your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={profile.timezone}
                      onChange={(e) => handleProfileChange('timezone', e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      value={profile.language}
                      onChange={(e) => handleProfileChange('language', e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleBasedAccess>
  )
}


