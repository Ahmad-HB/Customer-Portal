"use client"

import { useState, useEffect } from "react"
import { UserPlus, Eye, EyeOff, Edit, UserCheck, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RoleBasedAccess } from "@/components/RoleBasedAccess"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious, 
  PaginationEllipsis 
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import { ColorScheme } from "@/lib/color-scheme"

// User interface matching API response
interface User {
  id: string;
  identityUserId?: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  userType: number;
  role: string;
  isActive: boolean;
  supportTickets: any[];
  userServicePlans: any[];
  isDeleted: boolean;
  deleterId?: string;
  deletionTime?: string;
  lastModificationTime?: string;
  lastModifierId?: string;
  creationTime: string;
  creatorId?: string;
}

// Role interface for identity roles
interface Role {
  id: string;
  name: string;
  isDefault: boolean;
  isStatic: boolean;
  isPublic: boolean;
  concurrencyStamp: string;
  creationTime: string;
  extraProperties: any;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "Customer"
  })
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState("")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Role management state
  const [roles, setRoles] = useState<Role[]>([])
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState("")
  const [isUpdatingUser, setIsUpdatingUser] = useState(false)

  // Fetch users and roles on component mount
  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    
    try {
      console.log('Fetching users from API...')
      const response = await apiClient.getUsers()
      
      if (response.success) {
        const users = response.data.items
        console.log('Users fetched from app API:', users.length)
        
        // For now, let's skip the identity API calls to prevent hanging
        // and just use the users as they are from the app API
        setUsers(users)
        console.log('Users set in state:', users.length)
        
        // TODO: Later we can add back the identity API calls with proper error handling
        // and timeouts to prevent the page from hanging
      } else {
        setError(response.message || "Failed to fetch users")
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError("Failed to fetch users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      console.log('Fetching roles from API...')
      const response = await fetch('https://localhost:44338/api/identity/roles/all', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include' // Include cookies for session-based auth
      })
      
      console.log('Roles API response status:', response.status)
      
      if (response.ok) {
        const responseText = await response.text()
        console.log('Raw roles response:', responseText)
        
        // Check if response is HTML (error page)
        if (responseText.trim().startsWith('<')) {
          console.error('Roles API returned HTML instead of JSON. This usually means:')
          console.error('1. API endpoint not found (404)')
          console.error('2. Authentication required (login page)')
          console.error('3. Server error (error page)')
          console.error('4. CORS issues')
          return
        }
        
        const data = JSON.parse(responseText)
        console.log('Parsed roles data:', data)
        setRoles(data.items)
        console.log('Roles set in state:', data.items)
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch roles:', response.status, errorText)
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setSuccess("User created successfully!")
      
      // Clear form
      setFormData({
        username: "",
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "Customer"
      })
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setIsAddUserModalOpen(false)
        setSuccess("")
      }, 2000)
      
    } catch (err) {
      setError("Failed to create user. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      username: "",
      name: "",
      phone: "",
      email: "",
      password: "",
      role: "Customer"
    })
    setError("")
    setSuccess("")
    setShowPassword(false)
  }

  const getRoleBadgeVariant = () => {
    // Use default variant for all roles and rely on custom classes for colors
    return "default" as const
  }

  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case "admin":
        return "!bg-red-100 !text-red-800 !border-red-200"
      case "Technician":
        return "!bg-purple-100 !text-purple-800 !border-purple-200"
      case "SupportAgent":
        return "!bg-blue-100 !text-blue-800 !border-blue-200"
      case "Customer":
        return "!bg-yellow-100 !text-yellow-800 !border-yellow-200"
      default:
        return "!bg-gray-100 !text-gray-800 !border-gray-200"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "SupportAgent":
        return "Support Agent"
      default:
        return role
    }
  }

  const getStatusBadgeVariant = () => {
    // Use default variant for all statuses and rely on custom classes for colors
    return "default" as const
  }

  const getStatusBadgeClasses = (isActive: boolean) => {
    return isActive 
      ? "!bg-green-100 !text-green-800 !border-green-200" 
      : "!bg-red-100 !text-red-800 !border-red-200"
  }

  // Pagination logic
  const totalPages = Math.ceil(users.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = users.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: string) => {
    setItemsPerPage(Number(newPageSize))
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const handleToggleUserStatus = async (user: User) => {
    if (!user.identityUserId) {
      setError('User identity ID not available')
      return
    }
    
    setIsUpdatingUser(true)
    setError('')
    try {
      console.log('Fetching user data for:', user.identityUserId)
      
      // First, fetch the current user data to get all required fields
      const userResponse = await fetch(`https://localhost:44338/api/identity/users/${user.identityUserId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include' // Include cookies for session-based auth
      })
      if (!userResponse.ok) {
        const errorText = await userResponse.text()
        console.error('Failed to fetch user data:', userResponse.status, errorText)
        throw new Error(`Failed to fetch user data: ${userResponse.status} ${errorText}`)
      }
      
      let userData
      try {
        const responseText = await userResponse.text()
        console.log('Raw user response:', responseText)
        
        // Check if response is HTML (error page)
        if (responseText.trim().startsWith('<')) {
          console.error('API returned HTML instead of JSON. This usually means:')
          console.error('1. API endpoint not found (404)')
          console.error('2. Authentication required (login page)')
          console.error('3. Server error (error page)')
          console.error('4. CORS issues')
          throw new Error(`API returned HTML instead of JSON. Check if the endpoint exists and you're authenticated. Response: ${responseText.substring(0, 200)}...`)
        }
        
        userData = JSON.parse(responseText)
        console.log('User data fetched:', userData)
      } catch (parseError) {
        console.error('Failed to parse user data JSON:', parseError)
        throw new Error(`Failed to parse user data: ${parseError}`)
      }

      // Fetch current roles
      const rolesResponse = await fetch(`https://localhost:44338/api/identity/users/${user.identityUserId}/roles`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include' // Include cookies for session-based auth
      })
      if (!rolesResponse.ok) {
        const errorText = await rolesResponse.text()
        console.error('Failed to fetch user roles:', rolesResponse.status, errorText)
        throw new Error(`Failed to fetch user roles: ${rolesResponse.status} ${errorText}`)
      }
      
      let rolesData
      try {
        const responseText = await rolesResponse.text()
        console.log('Raw roles response:', responseText)
        
        // Check if response is HTML (error page)
        if (responseText.trim().startsWith('<')) {
          console.error('Roles API returned HTML instead of JSON. This usually means:')
          console.error('1. API endpoint not found (404)')
          console.error('2. Authentication required (login page)')
          console.error('3. Server error (error page)')
          console.error('4. CORS issues')
          throw new Error(`Roles API returned HTML instead of JSON. Check if the endpoint exists and you're authenticated. Response: ${responseText.substring(0, 200)}...`)
        }
        
        rolesData = JSON.parse(responseText)
        const currentRoles = rolesData.items.map((role: any) => role.name)
        console.log('User roles fetched:', currentRoles)
      } catch (parseError) {
        console.error('Failed to parse roles data JSON:', parseError)
        throw new Error(`Failed to parse roles data: ${parseError}`)
      }
      
      const currentRoles = rolesData.items.map((role: any) => role.name)

      // Determine the new active status (toggle current status)
      const newActiveStatus = !userData.isActive
      console.log('Current status:', userData.isActive, 'New status:', newActiveStatus)

      const updatePayload = {
        userName: userData.userName,
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        isActive: newActiveStatus,
        lockoutEnabled: userData.lockoutEnabled,
        roleNames: currentRoles,
        password: null,
        concurrencyStamp: null
      }
      console.log('Update payload:', updatePayload)

      // Update user with all required fields
      const updateResponse = await fetch(`https://localhost:44338/api/identity/users/${user.identityUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Include cookies for session-based auth
        body: JSON.stringify(updatePayload)
      })

      if (updateResponse.ok) {
        console.log('User status updated successfully')
        setSuccess(`User ${newActiveStatus ? 'activated' : 'deactivated'} successfully!`)
        setTimeout(() => setSuccess(''), 3000)
        // Refresh the user data to get the latest information
        await fetchUsers()
      } else {
        const errorText = await updateResponse.text()
        console.error('Failed to update user status:', updateResponse.status, errorText)
        setError(`Failed to update user status: ${updateResponse.status} ${errorText}`)
      }
    } catch (err) {
      console.error('Error in handleToggleUserStatus:', err)
      setError(`Failed to update user status: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsUpdatingUser(false)
    }
  }

  const handleEditRole = (user: User) => {
    setSelectedUser(user)
    setSelectedRole(user.role)
    setIsEditRoleModalOpen(true)
  }

  const handleUpdateUserRole = async () => {
    if (!selectedUser || !selectedRole || !selectedUser.identityUserId) return

    setIsUpdatingUser(true)
    setError('')
    try {
      console.log('Updating role for user:', selectedUser.identityUserId, 'to role:', selectedRole)
      
      const updatePayload = {
        roleNames: [selectedRole]
      }
      console.log('Role update payload:', updatePayload)

      // Update user role using the dedicated roles API endpoint
      const response = await fetch(`https://localhost:44338/api/identity/users/${selectedUser.identityUserId}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Include cookies for session-based auth
        body: JSON.stringify(updatePayload)
      })

      if (response.ok) {
        console.log('User role updated successfully')
        setSuccess('User role updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
        setIsEditRoleModalOpen(false)
        setSelectedUser(null)
        setSelectedRole('')
        // Refresh the user data to get the latest information
        await fetchUsers()
      } else {
        let errorText
        try {
          errorText = await response.text()
        } catch (textError) {
          errorText = 'Unable to read error message'
        }
        console.error('Failed to update user role:', response.status, errorText)
        setError(`Failed to update user role: ${response.status} ${errorText}`)
      }
    } catch (err) {
      console.error('Error in handleUpdateUserRole:', err)
      setError(`Failed to update user role: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsUpdatingUser(false)
    }
  }

  const generatePageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <RoleBasedAccess allowedRoles={[1]} fallback={<div>Access Denied</div>}>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage system users and permissions</p>
          </div>
          <Button 
            className="rounded-full bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsAddUserModalOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Add User Modal */}
        <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-lg font-semibold">Add New User</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                  {success}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleFormChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="Customer">Customer</option>
                  <option value="Technician">Technician</option>
                  <option value="Support Agent">Support Agent</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleFormChange}
                    required
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Creating User...
                    </div>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Role Modal */}
        <Dialog open={isEditRoleModalOpen} onOpenChange={setIsEditRoleModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-lg font-semibold">Edit User Role</DialogTitle>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role-select">Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        console.log('Roles array in dropdown:', roles)
                        return null
                      })()}
                      {roles.length === 0 ? (
                        <SelectItem value="loading" disabled>
                          Loading roles...
                        </SelectItem>
                      ) : (
                        roles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsEditRoleModalOpen(false)
                      setSelectedUser(null)
                      setSelectedRole('')
                    }}
                    disabled={isUpdatingUser}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={handleUpdateUserRole}
                    disabled={isUpdatingUser || !selectedRole}
                  >
                    {isUpdatingUser ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Updating...
                      </div>
                    ) : (
                      "Update Role"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Showing {startIndex + 1}-{Math.min(endIndex, users.length)} of {users.length} user{users.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="page-size" className="text-sm font-medium">
                  Show:
                </Label>
                <Select value={itemsPerPage.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger id="page-size" className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
                <span className="ml-2 text-muted-foreground">Loading users...</span>
              </div>
            ) : error ? (
              <div className={`p-4 rounded-lg border ${ColorScheme.alerts.error.bg} ${ColorScheme.alerts.error.border}`}>
                <p className={`text-sm ${ColorScheme.alerts.error.text}`}>{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchUsers}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {currentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={undefined} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={getRoleBadgeVariant()}
                      className={`border ${getRoleBadgeClasses(user.role)}`}
                    >
                      {getRoleDisplayName(user.role)}
                    </Badge>
                    <Badge 
                      variant={getStatusBadgeVariant()}
                      className={`border ${getStatusBadgeClasses(user.isActive)}`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Created: {new Date(user.creationTime).toLocaleDateString()}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditRole(user)}
                        disabled={isUpdatingUser || !user.identityUserId}
                        title={!user.identityUserId ? "Identity ID not available" : "Edit Role"}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggleUserStatus(user)}
                        disabled={isUpdatingUser || !user.identityUserId}
                        title={!user.identityUserId ? "Identity ID not available" : (user.isActive ? "Deactivate User" : "Activate User")}
                        className={user.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                      >
                        {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!loading && !error && users.length > 0 && totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {generatePageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => handlePageChange(page as number)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </RoleBasedAccess>
  )
}


