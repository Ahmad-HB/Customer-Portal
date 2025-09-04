"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Ticket, Package, Home } from "lucide-react"
import { RoleBasedAccess } from "@/components/RoleBasedAccess"

export default function CustomerDashboardPage() {
  return (
    <RoleBasedAccess allowedRoles={[2]} fallback={<div>Access Denied</div>}>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Welcome to Customer Portal</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/profile">
                <Button className="w-full">View Profile</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Support Tickets
              </CardTitle>
              <CardDescription>View and manage your tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/tickets">
                <Button className="w-full">View Tickets</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Service Plans
              </CardTitle>
              <CardDescription>Browse available service plans</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/plans">
                <Button className="w-full">View Plans</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Dashboard
              </CardTitle>
              <CardDescription>Return to main dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/">
                <Button className="w-full" variant="outline">Main Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedAccess>
  )
}
