"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"

export default function TechnicianProfilePage() {
  const { user } = useAuth()
  
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

  const handleEdit = () => {
    console.log("Edit technician profile:", formData)
    // In real app, this would save to API
    setOriginalData(formData)
    setHasChanges(false)
  }

  const handleCancel = () => {
    console.log("Cancel changes")
    setFormData(originalData)
    setHasChanges(false)
  }

  const completedTickets = [
    {
      id: 1,
      name: "Internet connection issues",
      status: "Completed",
      priority: "High",
      created: "10/01/2024",
      resolved: "10/02/2024",
      customer: "John Customer",
    },
    {
      id: 2,
      name: "Router configuration problem",
      status: "Completed",
      priority: "Medium",
      created: "08/01/2024",
      resolved: "08/01/2024",
      customer: "Jane Smith",
    },
    {
      id: 3,
      name: "Network speed optimization",
      status: "Completed",
      priority: "Low",
      created: "05/01/2024",
      resolved: "06/01/2024",
      customer: "Mike Johnson",
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

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Last Activity</h2>

        <div className="space-y-4">
          {completedTickets.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No completed tickets</h3>
                <p className="text-muted-foreground">You haven't completed any tickets yet.</p>
              </CardContent>
            </Card>
          ) : (
            completedTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{ticket.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Customer: {ticket.customer}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">STATUS</p>
                        <Badge className="mt-1 bg-green-100 text-green-800">{ticket.status}</Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">PRIORITY</p>
                        <Badge
                          variant="outline"
                          className={`mt-1 ${
                            ticket.priority === "High"
                              ? "border-red-200 text-red-600"
                              : ticket.priority === "Medium"
                                ? "border-yellow-200 text-yellow-600"
                                : "border-blue-200 text-blue-600"
                          }`}
                        >
                          {ticket.priority}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">CREATED</p>
                        <p className="mt-1 text-sm">{ticket.created}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">RESOLVED</p>
                        <p className="mt-1 text-sm font-medium text-green-600">{ticket.resolved}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
