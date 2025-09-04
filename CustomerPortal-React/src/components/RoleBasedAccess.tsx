import type { ReactNode } from 'react'
import { useCurrentAppUser } from '@/hooks/useAbpApi'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext' // Added import for useAuth
import { useCurrentUserRole } from '@/hooks/useAbpApi' // Added import for useCurrentUserRole

// Beautiful Access Denied Component
function AccessDenied({ userRole }: { userRole?: string }) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { role: currentRole, userType: currentUserType } = useCurrentUserRole()
  
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Determine the correct dashboard URL based on user role
  const getDashboardUrl = () => {
    if (currentUserType) {
      switch (currentUserType) {
        case 1: return '/admin/dashboard'      // Admin
        case 2: return '/customer/dashboard'   // Customer
        case 3: return '/profile/assigned-tickets'              // Support Agent (no dashboard)
        case 4: return '/profile/assigned-tickets'              // Technician (no dashboard)
        default: return '/profile'
      }
    } else if (currentRole) {
      switch (currentRole.toLowerCase()) {
        case 'admin': return '/admin/dashboard'
        case 'customer': return '/customer/dashboard'
        case 'supportagent': return '/profile'
        case 'technician': return '/profile'
        default: return '/profile'
      }
    }
    return '/profile' // Fallback
  }

  // Check if user has a dashboard
  const hasDashboard = () => {
    if (currentUserType) {
      return currentUserType === 1 || currentUserType === 2 // Admin or Customer
    } else if (currentRole) {
      return currentRole.toLowerCase() === 'admin' || currentRole.toLowerCase() === 'customer'
    }
    return false
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          {userRole 
            ? `You don't have permission to access this page. You are logged in as a ${userRole}.`
            : "You don't have permission to access this page."
          }
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            className="w-full"
          >
            Go Back
          </Button>
          
          {/* Profile button for all users */}
          <Button 
            onClick={() => navigate('/profile')} 
            variant="outline"
            className="w-full"
          >
            Go to Profile
          </Button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

// Beautiful Loading Component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
        <p className="text-gray-600">Checking your permissions...</p>
      </div>
    </div>
  )
}

interface RoleBasedAccessProps {
  children: ReactNode
  allowedRoles: number[] // Array of UserType values
  fallback?: ReactNode
  loadingFallback?: ReactNode
}

export function RoleBasedAccess({ 
  children, 
  allowedRoles, 
  fallback = <AccessDenied />,
  loadingFallback = <LoadingFallback />
}: RoleBasedAccessProps) {
  const { role: currentRole, isLoading: roleLoading, userType: currentUserType } = useCurrentUserRole()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // DEBUG: Log role information to understand what's happening
  console.log('🔒 [RoleBasedAccess] Debug Info:', {
    allowedRoles,
    currentRole,
    currentUserType,
    isAuthenticated,
    roleLoading,
    authLoading,
    routePath: window.location.pathname
  })

  // Show loading while either system is loading
  if (roleLoading || authLoading) {
    return <>{loadingFallback}</>
  }

  // If user is not authenticated at all, show fallback
  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  // CRITICAL: Check if user has the required role
  // We need to handle both string roles and numeric userTypes
  let hasAccess = false
  
  // First check: if we have a numeric userType, use that
  if (currentUserType && allowedRoles.includes(currentUserType)) {
    hasAccess = true
    console.log('🔒 [RoleBasedAccess] Access granted via userType:', currentUserType)
  }
  
  // Check string role if numeric check failed
  if (!hasAccess && currentRole) {
    const roleToUserType: Record<string, number> = {
      'admin': 1,
      'customer': 2,
      'supportagent': 3,
      'technician': 4,
      // Also handle the exact case from the API
      'SupportAgent': 3,
      'Admin': 1,
      'Customer': 2,
      'Technician': 4
    }
    
    const roleUserType = roleToUserType[currentRole] || roleToUserType[currentRole.toLowerCase()]
    if (roleUserType && allowedRoles.includes(roleUserType)) {
      hasAccess = true
    }
  }

  // SECURITY: If we can't determine the role at all, DENY access
  if (!currentUserType && !currentRole) {
    console.error('RoleBasedAccess: Could not determine user role, denying access for security')
    hasAccess = false
  }

  // ADDITIONAL SECURITY: Ensure users can only access routes for their specific role
  // This prevents any potential role conflicts or multiple role assignments
  if (hasAccess) {
    // Double-check that the user's actual role matches what they're trying to access
    const userActualRole = currentUserType || (currentRole ? 
      { 'admin': 1, 'customer': 2, 'supportAgent': 3, 'technician': 4, 'SupportAgent': 3, 'Admin': 1, 'Customer': 2, 'Technician': 4 }[currentRole] || 
      { 'admin': 1, 'customer': 2, 'supportAgent': 3, 'technician': 4 }[currentRole.toLowerCase()] : null
    )
    
    if (userActualRole && !allowedRoles.includes(userActualRole)) {
      console.error('RoleBasedAccess: Role mismatch detected, denying access for security')
      hasAccess = false
    }
  }

  // DEBUG: Log access decision
  console.log('🔒 [RoleBasedAccess] Access Decision:', {
    hasAccess,
    reason: !currentUserType && !currentRole ? 'No role determined' : 
            hasAccess ? 'Role matches allowedRoles' : 'Role does not match allowedRoles',
    userActualRole: currentUserType || (currentRole ? 
      { 'admin': 1, 'customer': 2, 'supportAgent': 3, 'technician': 4, 'SupportAgent': 3, 'Admin': 1, 'Customer': 2, 'Technician': 4 }[currentRole] || 
      { 'admin': 1, 'customer': 2, 'supportAgent': 3, 'technician': 4 }[currentRole.toLowerCase()] : null
    ),
    allowedRoles,
    currentRole,
    currentUserType
  })

  if (!hasAccess) {
    // Get user role name for better error message
    let roleName = 'Unknown'
    
    if (currentRole) {
      roleName = currentRole.charAt(0).toUpperCase() + currentRole.slice(1)
    } else if (currentUserType) {
      const userTypeNames = { 1: 'Admin', 2: 'Customer', 3: 'Support Agent', 4: 'Technician' }
      roleName = userTypeNames[currentUserType as keyof typeof userTypeNames] || 'Unknown'
    }
    
    console.log('🔒 [RoleBasedAccess] Access DENIED for user role:', roleName)
    return <AccessDenied userRole={roleName} />
  }

  console.log('🔒 [RoleBasedAccess] Access GRANTED for user')
  return <>{children}</>
}

// Convenience components for specific roles
export function AdminOnly({ children, fallback, loadingFallback }: Omit<RoleBasedAccessProps, 'allowedRoles'>) {
  console.log('🔒 [AdminOnly] Component rendered')
  return (
    <RoleBasedAccess allowedRoles={[1]} fallback={fallback} loadingFallback={loadingFallback}>
      {children}
    </RoleBasedAccess>
  )
}

export function CustomerOnly({ children, fallback, loadingFallback }: Omit<RoleBasedAccessProps, 'allowedRoles'>) {
  console.log('🔒 [CustomerOnly] Component rendered - checking if user is customer')
  return (
    <RoleBasedAccess allowedRoles={[2]} fallback={fallback} loadingFallback={loadingFallback}>
      {children}
    </RoleBasedAccess>
  )
}

export function SupportAgentOnly({ children, fallback, loadingFallback }: Omit<RoleBasedAccessProps, 'allowedRoles'>) {
  console.log('🔒 [SupportAgentOnly] Component rendered - checking if user is support agent')
  return (
    <RoleBasedAccess allowedRoles={[3]} fallback={fallback} loadingFallback={loadingFallback}>
      {children}
    </RoleBasedAccess>
  )
}

export function TechnicianOnly({ children, fallback, loadingFallback }: Omit<RoleBasedAccessProps, 'allowedRoles'>) {
  console.log('🔒 [TechnicianOnly] Component rendered - checking if user is technician')
  return (
    <RoleBasedAccess allowedRoles={[4]} fallback={fallback} loadingFallback={loadingFallback}>
      {children}
    </RoleBasedAccess>
  )
}

// Component for multiple allowed roles
export function MultiRoleAccess({ 
  children, 
  allowedRoles, 
  fallback, 
  loadingFallback 
}: RoleBasedAccessProps) {
  return (
    <RoleBasedAccess allowedRoles={allowedRoles} fallback={fallback} loadingFallback={loadingFallback}>
      {children}
    </RoleBasedAccess>
  )
}
