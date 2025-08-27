import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

// Import pages
import LoginPage from './login/page'
import SignupPage from './signup/page'
import ProfilePage from './profile/page'
import PlansPage from './plans/page'
import TicketsPage from './tickets/page'
import TechnicianProfilePage from './technician/profile/page'
import TechnicianAssignedTicketsPage from './technician/assigned-tickets/page'

// Import components
import { SidebarNav } from './components/sidebar-nav'
import { LogoutTest } from './components/logout-test'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { LoadingOverlay } from '@/components/ui/loading-spinner'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingOverlay text="Checking authentication..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
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

          {/* Protected Customer routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <div className="p-8">
                  <h1 className="text-3xl font-bold mb-8">Welcome to Customer Portal</h1>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile</CardTitle>
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
                        <CardTitle>Support Tickets</CardTitle>
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
                        <CardTitle>Service Plans</CardTitle>
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
                        <CardTitle>Logout Test</CardTitle>
                        <CardDescription>Test the logout functionality</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <LogoutTest />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><AppLayout><TicketsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/plans" element={<ProtectedRoute><AppLayout><PlansPage /></AppLayout></ProtectedRoute>} />

          {/* Protected Technician routes */}
          <Route path="/technician/profile" element={<ProtectedRoute><AppLayout><TechnicianProfilePage /></AppLayout></ProtectedRoute>} />
          <Route path="/technician/assigned-tickets" element={<ProtectedRoute><AppLayout><TechnicianAssignedTicketsPage /></AppLayout></ProtectedRoute>} />

          {/* Protected Support Agent routes (placeholder) */}
          <Route path="/support/*" element={<ProtectedRoute><AppLayout><div className="p-8"><h1>Support Agent Portal (Coming Soon)</h1></div></AppLayout></ProtectedRoute>} />

          {/* Protected Admin routes (placeholder) */}
          <Route path="/admin/*" element={<ProtectedRoute><AppLayout><div className="p-8"><h1>Admin Portal (Coming Soon)</h1></div></AppLayout></ProtectedRoute>} />

          {/* Default redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
