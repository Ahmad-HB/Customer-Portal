"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useTickets } from "@/hooks/useTickets"
import { useUserServicePlans } from "@/hooks/useUserServicePlans"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { tickets, loading: ticketsLoading } = useTickets()
  const { 
    userServicePlans, 
    loading: plansLoading, 
    suspendUserServicePlan, 
    reactivateUserServicePlan 
  } = useUserServicePlans()
  
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    phone: "",
    address: "",
  })

  const [originalData, setOriginalData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    phone: "",
    address: "",
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Initialize with real user data from backend
  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || "",
        surname: "", // Backend doesn't seem to have surname
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        address: "", // Backend doesn't seem to have address
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
    <div className="p-8">
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
                value={formData.surname}
                onChange={handleChange}
                className="rounded-full"
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
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="rounded-full"
              />
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
