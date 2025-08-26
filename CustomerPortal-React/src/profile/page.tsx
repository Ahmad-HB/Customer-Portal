"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
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

  // Initialize with sample data (in real app, this would come from API)
  useEffect(() => {
    const initialData = {
      name: "John",
      surname: "Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      phone: "+1 234 567 8900",
      address: "123 Main St, City, State 12345",
    }
    setFormData(initialData)
    setOriginalData(initialData)
  }, [])

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

  const handleEdit = () => {
    console.log("Edit profile:", formData)
    // In real app, this would save to API
    setOriginalData(formData)
    setHasChanges(false)
  }

  const handleCancel = () => {
    console.log("Cancel changes")
    setFormData(originalData)
    setHasChanges(false)
  }

  // Sample data for tickets
  const tickets = [
    {
      id: 1,
      name: "Name of Ticket",
      status: "Open",
      priority: "low",
      created: "15/01/2024",
    },
    {
      id: 2,
      name: "Name of Ticket",
      status: "Open",
      priority: "low",
      created: "15/01/2024",
    },
  ]

  // Sample data for service plans
  const servicePlans = [
    {
      id: 1,
      name: "Plan name",
      status: "Active",
      price: "$29.99/month",
    },
    {
      id: 2,
      name: "Plan name",
      status: "Active",
      price: "$29.99/month",
    },
  ]

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
                size="sm"
                className="rounded-full bg-green-500 hover:bg-green-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Save Changes
              </Button>
              <Button
                onClick={handleCancel}
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
            <div className="space-y-4">
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
                          <p className="mt-1 text-sm">{ticket.created}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="service-plans" className="mt-6">
            <div className="space-y-4">
              {servicePlans.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{plan.name}</h3>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">STATUS</p>
                          <Badge className="mt-1 bg-green-100 text-green-800">{plan.status}</Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">PRICE</p>
                          <p className="mt-1 text-sm font-medium text-blue-600">{plan.price}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="destructive" size="sm" className="rounded-full">
                            Suspend
                          </Button>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
