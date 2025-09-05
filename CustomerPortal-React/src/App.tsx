import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { useCurrentUserRole } from "@/hooks/useAbpApi"
import { SidebarNav } from "@/components/sidebar-nav"
import { RoleBasedAccess } from "@/components/RoleBasedAccess"
import { LoadingOverlay } from "@/components/ui/loading-spinner"
import { useSessionMonitor } from "@/hooks/useSessionMonitor"
import { useEffect } from "react"

// Import pages
import LoginPage from "@/login/page"
import SignupPage from "@/signup/page"
import TicketsPage from "@/tickets/page"
import PlansPage from "@/plans/page"
import ProfilePage from "@/profile/page"
import TechnicianProfilePage from "@/technician/profile/page"
import TechnicianAssignedTicketsPage from "@/technician/assigned-tickets/page"
import SupportAssignedTicketsPage from "@/support/assigned-tickets/page"
import SupportProfilePage from "@/support/profile/page"
import AdminDashboardPage from "@/admin/dashboard/page"
import AdminUsersPage from "@/admin/users/page"

// Role-based access components
const AdminOnly = ({ children }: { children: React.ReactNode }) => (
  <RoleBasedAccess allowedRoles={[1]} fallback={<div>Access Denied</div>}>
    {children}
  </RoleBasedAccess>
)

const CustomerOnly = ({ children }: { children: React.ReactNode }) => (
  <RoleBasedAccess allowedRoles={[2]} fallback={<div>Access Denied</div>}>
    {children}
  </RoleBasedAccess>
)

const SupportAgentOnly = ({ children }: { children: React.ReactNode }) => (
  <RoleBasedAccess allowedRoles={[3]} fallback={<div>Access Denied</div>}>
    {children}
  </RoleBasedAccess>
)

const TechnicianOnly = ({ children }: { children: React.ReactNode }) => (
  <RoleBasedAccess allowedRoles={[4]} fallback={<div>Access Denied</div>}>
    {children}
  </RoleBasedAccess>
)

// Helper function to get the appropriate URL for each role
function getDashboardUrlForRole(role: string | null): string {
  if (!role) {
    console.warn('🔒 [getDashboardUrlForRole] No role provided, defaulting to profile')
    return '/profile'
  }

  // Normalize role to lowercase for comparison
  const normalizedRole = role.toLowerCase()
  
  console.log(`🔒 [getDashboardUrlForRole] Processing role: "${role}" (normalized: "${normalizedRole}")`)
  
  switch (normalizedRole) {
    case 'admin':
      console.log('🔒 [getDashboardUrlForRole] Admin user -> /admin/dashboard')
      return '/admin/dashboard'
    case 'supportagent':
    case 'support_agent':
      console.log('🔒 [getDashboardUrlForRole] Support Agent -> /support/profile')
      return '/support/profile'
    case 'technician':
      console.log('🔒 [getDashboardUrlForRole] Technician -> /technician/assigned-tickets')
      return '/technician/assigned-tickets'
    case 'customer':
      console.log('🔒 [getDashboardUrlForRole] Customer -> /profile')
      return '/profile'
    default:
      console.warn(`🔒 [getDashboardUrlForRole] Unknown role "${role}", defaulting to profile`)
      return '/profile'
  }
}

// Protected Route Component with role-based access control
function ProtectedRoute({ 
  children, 
  redirectToRoleDashboard = false 
}: { 
  children: React.ReactNode
  redirectToRoleDashboard?: boolean
}) {
  const { isAuthenticated, isLoading, checkSession } = useAuth()
  const { role: currentRole, isLoading: roleLoading } = useCurrentUserRole()
  
  // Monitor session status
  useSessionMonitor()

  // Check session when component mounts to ensure it's still valid
  useEffect(() => {
    if (checkSession) {
      checkSession()
    }
  }, [checkSession])

  // Show loading only if we're still checking authentication OR if we need role info but don't have it yet
  if (isLoading || (redirectToRoleDashboard && roleLoading)) {
    return <LoadingOverlay text="Checking authentication..." />
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('🔒 [ProtectedRoute] User not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // If user is authenticated and we need to redirect to their role dashboard
  if (redirectToRoleDashboard) {
    // If we have a role, redirect immediately
    if (currentRole) {
      const userDashboard = getDashboardUrlForRole(currentRole)
      console.log(`🔒 [ProtectedRoute] Redirecting ${currentRole} user to: ${userDashboard}`)
      return <Navigate to={userDashboard} replace />
    }
    
    // If we don't have a role yet but user is authenticated, show loading
    if (roleLoading) {
      return <LoadingOverlay text="Loading your dashboard..." />
    }
    
    // If we have no role and not loading, something went wrong - redirect to profile
    console.warn('🔒 [ProtectedRoute] User authenticated but no role found, redirecting to profile')
    return <Navigate to="/profile" replace />
  }

  // NOTE: Role checking is now handled by RoleBasedAccess components
  // This component only checks authentication, not specific roles
  // Remove the old role checking logic to prevent conflicts
  
  return <>{children}</>
}

// Root redirect component that shows user info while redirecting
function RootRedirectComponent() {
  const { user } = useAuth()
  const { role: currentRole } = useCurrentUserRole()
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
        <p className="text-muted-foreground mb-4">Redirecting you to your dashboard...</p>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-600">
            You are logged in as: <span className="font-semibold text-primary">
              {user?.name || user?.username || 'Loading...'}
            </span>
          </p>
          {currentRole && (
            <p className="text-xs text-gray-500 mt-1">
              Role: <span className="font-medium capitalize">{currentRole}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Unified layout that works for all roles
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen bg-background">
    <SidebarNav />
    <main className="flex-1 overflow-auto">
      {children}
    </main>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Root route - redirect to user's appropriate dashboard */}
          <Route path="/" element={
            <ProtectedRoute redirectToRoleDashboard={true}>
              <RootRedirectComponent />
            </ProtectedRoute>
          } />

          <Route path="/tickets" element={
            <CustomerOnly>
              <AppLayout>
                <TicketsPage />
              </AppLayout>
            </CustomerOnly>
          } />
          <Route path="/plans" element={
            <CustomerOnly>
              <AppLayout>
                <PlansPage />
              </AppLayout>
            </CustomerOnly>
          } />
          {/* Catch-all for any other customer paths - MUST be last */}
          <Route path="/customer/*" element={
            <CustomerOnly>
              <AppLayout>
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">Customer Portal</h1>
                  <p className="text-muted-foreground">Access denied. This area is restricted to customers only.</p>
                </div>
              </AppLayout>
            </CustomerOnly>
          } />

          {/* Protected Profile routes - accessible by all authenticated users */}
          <Route path="/profile" element={
            <RoleBasedAccess allowedRoles={[1, 2, 3, 4]}>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </RoleBasedAccess>
          } />

          {/* Protected Technician routes */}
          <Route path="/technician/profile" element={
            <TechnicianOnly>
              <AppLayout>
                <TechnicianProfilePage />
              </AppLayout>
            </TechnicianOnly>
          } />
          <Route path="/technician/assigned-tickets" element={
            <TechnicianOnly>
              <AppLayout>
                <TechnicianAssignedTicketsPage />
              </AppLayout>
            </TechnicianOnly>
          } />

          {/* Protected Support Agent routes */}
          <Route path="/support/assigned-tickets" element={
            <SupportAgentOnly>
              <AppLayout>
                <SupportAssignedTicketsPage />
              </AppLayout>
            </SupportAgentOnly>
          } />
          <Route path="/support/profile" element={
            <SupportAgentOnly>
              <AppLayout>
                <SupportProfilePage />
              </AppLayout>
            </SupportAgentOnly>
          } />

          {/* Protected Admin routes */}
          <Route path="/admin/dashboard" element={
            <AdminOnly>
              <AppLayout>
                <AdminDashboardPage />
              </AppLayout>
            </AdminOnly>
          } />
          <Route path="/admin/users" element={
            <AdminOnly>
              <AppLayout>
                <AdminUsersPage />
              </AppLayout>
            </AdminOnly>
          } />
          <Route path="/admin/profile" element={
            <AdminOnly>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </AdminOnly>
          } />


          {/* Default redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
