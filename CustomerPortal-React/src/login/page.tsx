"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useCurrentUserRole } from "@/hooks/useAbpApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Eye, EyeOff } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth()
  const { role: currentRole, isLoading: roleLoading, isAdmin, isCustomer, isTechnician, isSupportAgent } = useCurrentUserRole()

  // Check for remembered user on component mount and redirect if already authenticated
  useEffect(() => {
    const rememberedUser = localStorage.getItem('remembered_user')
    const isRemembered = localStorage.getItem('remember_me') === 'true'
    
    if (rememberedUser && isRemembered) {
      setUsernameOrEmail(rememberedUser)
      setRememberMe(true)
    }
    
    // If user is already authenticated and role is determined, redirect them to appropriate page
    if (isAuthenticated && user && !authLoading && !roleLoading && currentRole) {
      console.log('User already authenticated, redirecting based on role:', currentRole)
      
      if (isAdmin) {
        navigate('/admin/dashboard')
      } else if (isTechnician) {
        navigate('/technician/assigned-tickets')
      } else if (isSupportAgent) {
        navigate('/support/profile')
      } else if (isCustomer) {
        navigate('/customer/dashboard')
      } else {
        // Fallback to profile page
        navigate('/profile')
      }
    }
  }, [isAuthenticated, user, authLoading, roleLoading, currentRole, isAdmin, isCustomer, isTechnician, isSupportAgent, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(usernameOrEmail, password, rememberMe)
      
      if (success) {
        // Login successful, redirect based on role
        if (isTechnician) {
          navigate("/technician/assigned-tickets")
        } else if (isSupportAgent) {
          navigate("/support/profile")
        } else if (isAdmin) {
          navigate("/admin/dashboard")
        } else if (isCustomer) {
          navigate("/customer/dashboard")
        } else {
          // Fallback to profile page
          navigate("/profile")
        }
      } else {
        setError("Invalid username/email or password")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading spinner while checking authentication or role
  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    )
  }

  // If already authenticated, show loading while redirecting
  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner text="Redirecting..." />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Log in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail">Username or Email</Label>
              <Input
                id="usernameOrEmail"
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                className="rounded-full"
                placeholder="Enter your username or email address"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-full pr-10"
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
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <Label
                htmlFor="remember-me"
                className="text-sm font-normal cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 hover:shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Signing In...
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center space-y-2">
            <Link to="/signup" className="text-sm text-destructive hover:underline transition-colors">
              {"Don't have an account?"}
            </Link>
            <div className="text-xs text-muted-foreground">
              <p><strong>Demo Credentials:</strong></p>
              <p>Username/Email: customer@example.com | Password: password123</p>
              <p>Username/Email: technician@example.com | Password: password123</p>
              <p>Username/Email: support@example.com | Password: password123</p>
              <p>Username/Email: admin@example.com | Password: password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
