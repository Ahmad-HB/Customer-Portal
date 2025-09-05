"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrentUserRole } from '@/hooks/useAbpApi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Shield, Loader2 } from 'lucide-react'
import { useTickets } from "@/hooks/useTickets"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStatusColor, getPriorityColor, ColorScheme } from "@/lib/color-scheme"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { role: currentRole, isLoading: roleLoading, isAdmin } = useCurrentUserRole()
  const { tickets, loading: ticketsLoading } = useTickets()

  // Filter tickets for completed activities (status 3 = Resolved, 4 = Closed)
  const completedTickets = tickets.filter(ticket => ticket.status === 3 || ticket.status === 4)

  // Helper functions for ticket display
  const getStatusDisplay = (status: number) => {
    switch (status) {
      case 1: return { text: 'Open', color: getStatusColor(1) }
      case 2: return { text: 'In Progress', color: getStatusColor(2) }
      case 3: return { text: 'Resolved', color: getStatusColor(3) }
      case 4: return { text: 'Closed', color: getStatusColor(4) }
      default: return { text: 'Unknown', color: getStatusColor(0) }
    }
  }

  const getPriorityDisplay = (priority: number, isAssigned: boolean) => {
    if (!isAssigned) {
      return { text: 'Not Priority Yet', color: getPriorityColor(0) }
    }
    
    switch (priority) {
      case 1: return { text: 'Low', color: getPriorityColor(1) }
      case 2: return { text: 'Medium', color: getPriorityColor(2) }
      case 3: return { text: 'High', color: getPriorityColor(3) }
      default: return { text: 'Not Priority Yet', color: getPriorityColor(0) }
    }
  }

  // State for profile data from APIs
  const [profileData, setProfileData] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  
  // Temporary debugging
  useEffect(() => {
    console.log('🔍 [Profile Debug] Full user object from AuthContext:', user)
    console.log('🔍 [Profile Debug] Profile data from API:', profileData)
    console.log('🔍 [Profile Debug] currentRole from useCurrentUserRole:', currentRole)
    console.log('🔍 [Profile Debug] isAdmin from useCurrentUserRole:', isAdmin)
    console.log('🔍 [Profile Debug] roleLoading:', roleLoading)
  }, [user, profileData, currentRole, isAdmin, roleLoading])

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
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch profile data from the two APIs
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setProfileLoading(true)
        setProfileError(null)
        
        console.log('🔍 [Profile Debug] Fetching profile data from APIs...')
        
        // Fetch user profile data from /api/account/my-profile
        const profileResponse = await fetch('https://localhost:44338/api/account/my-profile', {
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
          },
          credentials: 'include'
        })

        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch profile: ${profileResponse.status}`)
        }

        const profileData = await profileResponse.json()
        console.log('🔍 [Profile Debug] Profile data from /api/account/my-profile:', profileData)
        
        // Fetch user role from /api/app/app-user/currnt-user-role
        const roleResponse = await fetch('https://localhost:44338/api/app/app-user/currnt-user-role', {
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
          },
          credentials: 'include'
        })

        if (!roleResponse.ok) {
          throw new Error(`Failed to fetch role: ${roleResponse.status}`)
        }

        const userRole = await roleResponse.text() // API returns string, not JSON
        console.log('🔍 [Profile Debug] User role from /api/app/app-user/currnt-user-role:', userRole)
        
        // Combine the data
        const combinedData = {
          ...profileData,
          role: userRole
        }
        
        setProfileData(combinedData)
        
        // Initialize form data with the API data
        const userData = {
          name: profileData.name || "",
          surname: profileData.surname || "",
          username: profileData.userName || "",
          email: profileData.email || "",
          phone: profileData.phoneNumber || "",
          role: userRole || "",
          concurrencyStamp: profileData.concurrencyStamp || "",
        }
        
        setFormData(userData)
        setOriginalData(userData)
        console.log('🔍 [Profile Debug] Form data initialized with API data:', userData)
        
      } catch (error) {
        console.error('Error fetching profile data:', error)
        setProfileError(error instanceof Error ? error.message : 'Failed to fetch profile data')
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfileData()
  }, [])

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
    setError(null)
    setSuccess(null)
    
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
        setSuccess('Profile updated successfully! Refreshing page...')
        // Refresh the page after successful update to ensure clean state
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setError('Failed to update profile. Please try again.')
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    console.log("Cancel changes")
    setFormData(originalData)
    setHasChanges(false)
    setError(null)
    setSuccess(null)
  }


  // Show loading state if profile data is not available yet
  if (profileLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading user profile...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if profile data failed to load
  if (profileError) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <Shield className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-4">{profileError}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header with role display */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {window.location.pathname === '/admin/profile' ? 'Admin Profile' : 'Profile'}
          </h1>
          {!roleLoading && (formData.role || currentRole || user?.role) && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              <Badge variant="secondary" className="capitalize">
                {formData.role || currentRole || user?.role}
              </Badge>
              {isAdmin && (
                <Badge variant="destructive">Administrator</Badge>
              )}
              {window.location.pathname === '/admin/profile' && (
                <Badge variant="outline">Admin Route</Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`mb-6 p-4 ${ColorScheme.alerts.error.bg} border ${ColorScheme.alerts.error.border} rounded-lg`}>
          <p className={`${ColorScheme.alerts.error.text} text-sm`}>{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className={`mb-6 p-4 ${ColorScheme.alerts.success.bg} border ${ColorScheme.alerts.success.border} rounded-lg`}>
          <p className={`${ColorScheme.alerts.success.text} text-sm`}>{success}</p>
        </div>
      )}



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

      {/* Last Activity Section */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Last Activity</h2>

        <Tabs defaultValue="all-activities" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all-activities">All Activities</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all-activities" className="mt-6">
            {ticketsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">Loading tickets...</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tickets found.</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg bg-gray-50">
                <div className="h-[calc(100vh-300px)] overflow-y-auto p-4 space-y-4">
                  {tickets.map((ticket) => {
                    const statusDisplay = getStatusDisplay(ticket.status)
                    const isAssigned = !!(ticket.supportagentName || ticket.technicianId)
                    const priorityDisplay = getPriorityDisplay(ticket.priority, isAssigned)
                    
                    return (
                      <Card key={ticket.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{ticket.subject}</h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {ticket.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-8">
                              <div className="text-center">
                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">STATUS</p>
                                <Badge className={`${statusDisplay.color} text-xs mt-1`}>
                                  {statusDisplay.text}
                                </Badge>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">PRIORITY</p>
                                <Badge className={`${priorityDisplay.color} text-xs mt-1`}>
                                  {priorityDisplay.text}
                                </Badge>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">SUPPORT AGENT</p>
                                <p className="mt-1 text-sm text-green-700 font-medium">
                                  {ticket.supportagentName || 'Not assigned'}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">TECHNICIAN</p>
                                <p className="mt-1 text-sm text-purple-700 font-medium">
                                  {ticket.technicianName || 'Not assigned'}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">CREATED</p>
                                <p className="mt-1 text-sm text-gray-700 font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {ticketsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">Loading completed activities...</span>
              </div>
            ) : completedTickets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No completed activities found.</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg bg-gray-50">
                <div className="h-[calc(100vh-300px)] overflow-y-auto p-4 space-y-4">
                  {completedTickets.map((ticket) => {
                    const statusDisplay = getStatusDisplay(ticket.status)
                    const isAssigned = !!(ticket.supportagentName || ticket.technicianId)
                    const priorityDisplay = getPriorityDisplay(ticket.priority, isAssigned)
                    
                    return (
                      <Card key={ticket.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{ticket.subject}</h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {ticket.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-8">
                              <div className="text-center">
                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">STATUS</p>
                                <Badge className={`${statusDisplay.color} text-xs mt-1`}>
                                  {statusDisplay.text}
                                </Badge>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">PRIORITY</p>
                                <Badge className={`${priorityDisplay.color} text-xs mt-1`}>
                                  {priorityDisplay.text}
                                </Badge>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">SUPPORT AGENT</p>
                                <p className="mt-1 text-sm text-green-700 font-medium">
                                  {ticket.supportagentName || 'Not assigned'}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">TECHNICIAN</p>
                                <p className="mt-1 text-sm text-purple-700 font-medium">
                                  {ticket.technicianName || 'Not assigned'}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">CREATED</p>
                                <p className="mt-1 text-sm text-gray-700 font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>

    </div>
  )
}
