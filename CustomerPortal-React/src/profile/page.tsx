"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrentUserRole } from '@/hooks/useAbpApi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, EyeOff, Shield, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useTickets } from "@/hooks/useTickets"
import { useUserServicePlans } from "@/hooks/useUserServicePlans"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiClient } from '@/lib/api-client'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { role: currentRole, isLoading: roleLoading, isAdmin } = useCurrentUserRole()
  const { tickets, loading: ticketsLoading } = useTickets()
  const { 
    userServicePlans, 
    loading: plansLoading, 
    suspendUserServicePlan, 
    reactivateUserServicePlan 
  } = useUserServicePlans()

  // State for AppUser data from the backend
  const [appUserData, setAppUserData] = useState<any>(null)
  const [appUserLoading, setAppUserLoading] = useState(true)
  
  // Temporary debugging
  useEffect(() => {
    console.log('🔍 [Profile Debug] user.role from AuthContext:', user?.role)
    console.log('🔍 [Profile Debug] currentRole from useCurrentUserRole:', currentRole)
    console.log('🔍 [Profile Debug] isAdmin from useCurrentUserRole:', isAdmin)
    console.log('🔍 [Profile Debug] roleLoading:', roleLoading)
  }, [user?.role, currentRole, isAdmin, roleLoading])
  
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    phone: "",
    role: "",
  })

  const [originalData, setOriginalData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    phone: "",
    role: "",
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch user profile data directly from /api/account/my-profile
  useEffect(() => {
    const fetchUserProfileData = async () => {
      try {
        setAppUserLoading(true)
        const response = await fetch('https://localhost:44338/api/account/my-profile', {
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
          },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`)
        }

        const data = await response.json()
        setAppUserData(data)
        console.log('🔍 [Profile Debug] User profile data from /api/account/my-profile:', data)
      } catch (error) {
        console.error('Error fetching user profile data:', error)
      } finally {
        setAppUserLoading(false)
      }
    }

    fetchUserProfileData()
  }, [])

  // Initialize with real user data from /api/account/my-profile
  useEffect(() => {
    if (appUserData && currentRole && !roleLoading) {
      const userData = {
        name: appUserData.name || "",           // ✅ Use name from /api/account/my-profile
        surname: appUserData.surname || "",     // ✅ Use surname from /api/account/my-profile (can be null)
        username: appUserData.userName || "",   // ✅ Use userName from /api/account/my-profile
        email: appUserData.email || "",         // ✅ Use email from /api/account/my-profile
        phone: appUserData.phoneNumber || "",   // ✅ Use phoneNumber from /api/account/my-profile
        role: currentRole || "",
      }
      setFormData(userData)
      setOriginalData(userData)
      console.log('🔍 [Profile Debug] Form data initialized with /api/account/my-profile data:', userData)
    }
  }, [appUserData, currentRole, roleLoading])

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
        phone: formData.phone
      })
      
      if (success) {
        setSuccess('Profile updated successfully!')
        setOriginalData(formData)
        setHasChanges(false)
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
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

  const handleSuspend = async (subscriptionId: string) => {
    setActionLoading(subscriptionId)
    setError(null)
    setSuccess(null)
    
    try {
      const success = await suspendUserServicePlan(subscriptionId)
      if (success) {
        setSuccess('Service plan suspended successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Failed to suspend service plan. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReactivate = async (subscriptionId: string) => {
    setActionLoading(subscriptionId)
    setError(null)
    setSuccess(null)
    
    try {
      const success = await reactivateUserServicePlan(subscriptionId)
      if (success) {
        setSuccess('Service plan reactivated successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Failed to reactivate service plan. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header with role display */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {window.location.pathname === '/admin/profile' ? 'Admin Profile' : 'Profile'}
          </h1>
          {!roleLoading && currentRole && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              <Badge variant="secondary" className="capitalize">
                {currentRole}
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
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm">{success}</p>
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
              <Input id="name" name="name" value={formData.name} onChange={handleChange} className="rounded-full" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">Surname</Label>
              <Input
                id="surname"
                name="surname"
                value={formData.surname || ""}
                onChange={handleChange}
                className="rounded-full"
                placeholder="No surname"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">User name</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="rounded-full"
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
                className="rounded-full"
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
                value={formData.phone}
                onChange={handleChange}
                className="rounded-full"
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
                value={formData.role}
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

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="service-plans">Service Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="mt-6">
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
              <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                {tickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{ticket.name}</h3>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">STATUS</p>
                            <Badge variant="secondary" className="mt-1 bg-yellow-100 text-yellow-800">
                              {ticket.status}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">PRIORITY</p>
                            <Badge variant="outline" className="mt-1 border-blue-200 text-blue-600">
                              {ticket.priority}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">CREATED</p>
                            <p className="mt-1 text-sm">{ticket.creationTime ? new Date(ticket.creationTime).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="service-plans" className="mt-6">
            {plansLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">Loading subscriptions...</span>
              </div>
            ) : userServicePlans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No subscriptions found.</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg bg-gray-50">
                <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                  {userServicePlans.map((subscription: any) => (
                    <Card key={subscription.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{subscription.servicePlanName}</h3>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">STATUS</p>
                              <Badge className={`mt-1 ${
                                subscription.isActive && !subscription.isSuspended 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {subscription.isActive && !subscription.isSuspended ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">START DATE</p>
                              <p className="mt-1 text-sm">{new Date(subscription.startDate).toLocaleDateString()}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">END DATE</p>
                              <p className="mt-1 text-sm font-medium text-blue-600">
                                {new Date(subscription.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {subscription.isActive && !subscription.isSuspended ? (
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  className="rounded-full"
                                  onClick={() => handleSuspend(subscription.id)}
                                  disabled={actionLoading === subscription.id}
                                >
                                  {actionLoading === subscription.id ? (
                                    <div className="flex items-center gap-2">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Suspending...
                                    </div>
                                  ) : (
                                    'Suspend'
                                  )}
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-full bg-green-500 text-white hover:bg-green-600"
                                  onClick={() => handleReactivate(subscription.id)}
                                  disabled={actionLoading === subscription.id}
                                >
                                  {actionLoading === subscription.id ? (
                                    <div className="flex items-center gap-2">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Reactivating...
                                    </div>
                                  ) : (
                                    'Reactivate'
                                  )}
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                                Change Plan
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
