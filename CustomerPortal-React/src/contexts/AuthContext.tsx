import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { apiClient, type User, type RegisterRequest } from '@/lib/api-client'

// Utility function to get the correct dashboard URL for each role
// This is now handled in App.tsx with the updated version

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionStatus: 'active' | 'expired' | 'checking' | 'none'
  login: (usernameOrEmail: string, password: string, rememberMe?: boolean) => Promise<boolean>
  register: (userData: RegisterRequest) => Promise<boolean>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<boolean>
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionStatus, setSessionStatus] = useState<'active' | 'expired' | 'checking' | 'none'>('checking')
  const [sessionCheckInterval, setSessionCheckInterval] = useState<NodeJS.Timeout | null>(null)

  // Session monitoring function
  const checkSession = async () => {
    setSessionStatus('checking')
    
    // Always try to get current user from the new API endpoint first
    // This ensures we check the backend session on every page refresh
    try {
      console.log('Checking backend session via new API endpoint...')
      const response = await apiClient.getCurrentUser()
      if (response.success && response.data) {
        setUser(response.data)
        setSessionStatus('active')
        console.log('Authenticated via backend session:', response.data)
        return
      }
    } catch (error) {
      console.log('Backend session check failed:', error)
    }
    
    // Fallback to legacy token-based authentication
    const token = apiClient.getToken()
    const demoToken = localStorage.getItem('demo_token')
    
    if (!token && !demoToken) {
      setSessionStatus('none')
      setUser(null)
      return
    }
    
    if (token && !token.startsWith('temp_')) {
      try {
        const response = await apiClient.getCurrentUser()
        if (response.success && response.data) {
          setUser(response.data)
          setSessionStatus('active')
        } else {
          // Token is invalid, clear it
          apiClient.logout()
          setUser(null)
          setSessionStatus('expired')
        }
      } catch (error) {
        console.error('Token-based session check failed:', error)
        apiClient.logout()
        setUser(null)
        setSessionStatus('expired')
      }
    } else if (demoToken || (token && token.startsWith('temp_'))) {
      // Demo authentication - create a demo user
      const demoUser: User = {
        id: '1',
        username: 'demo@example.com',
        name: 'Demo User',
        email: 'demo@example.com',
        phone: '+1234567890',
        role: 'customer',
        emailConfirmed: true,
        phoneNumberConfirmed: true,
        creationTime: new Date().toISOString(),
        creatorId: '1',
        lastModificationTime: new Date().toISOString(),
        lastModifierId: '1',
        isDeleted: false,
        deleterId: undefined,
        deletionTime: undefined
      }
      setUser(demoUser)
      setSessionStatus('active')
    }
  }

  // Check if user is already authenticated on app load
  useEffect(() => {
    // Immediately check session on app load
    checkSession().finally(() => {
      setIsLoading(false)
    })
    
    // Also check session after a short delay to handle any race conditions
    const immediateCheck = setTimeout(() => {
      if (!user) {
        console.log('Performing immediate session re-check...')
        checkSession()
      }
    }, 1000)
    
    return () => clearTimeout(immediateCheck)
  }, [])

  // Set up periodic session checking and focus-based checking
  useEffect(() => {
    // Clear any existing interval
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval)
    }

    // Only set up interval if user is authenticated
    if (user && sessionStatus === 'active') {
      const interval = setInterval(() => {
        console.log('Checking session status...')
        checkSession()
      }, 5 * 60 * 1000) // Check every 5 minutes
      
      setSessionCheckInterval(interval)
    }

    // Check session when window gains focus (user returns to tab)
    const handleFocus = () => {
      if (user) {
        console.log('Window focused, checking session...')
        checkSession()
      }
    }

    // Check session when user navigates (route changes)
    const handleRouteChange = () => {
      if (user) {
        console.log('Route changed, checking session...')
        checkSession()
      }
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('popstate', handleRouteChange)

    // Cleanup on unmount
    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval)
      }
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [user, sessionStatus])

  const login = async (usernameOrEmail: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log('Attempting login with:', { usernameOrEmail, rememberMe })
      
      // Real API authentication
      const response = await apiClient.login(usernameOrEmail, password)
      console.log('Login response:', response)
      
      if (response.success && response.data) {
        // Get user data after successful login using the new API endpoint
        console.log('Login successful, fetching user data...')
        const userResponse = await apiClient.getCurrentUser()
        console.log('User response:', userResponse)
        
        if (userResponse.success && userResponse.data) {
          console.log('Setting user data:', userResponse.data)
          console.log('User role:', userResponse.data.role)
          setUser(userResponse.data)
          setSessionStatus('active')
          console.log('User authenticated successfully:', userResponse.data)
          
          // Handle remember me functionality
          if (rememberMe) {
            localStorage.setItem('remember_me', 'true')
            localStorage.setItem('remembered_user', usernameOrEmail)
          } else {
            localStorage.removeItem('remember_me')
            localStorage.removeItem('remembered_user')
          }
          
          return true
        } else {
          console.log('Failed to get user data after login:', userResponse.message)
        }
      }
      
      console.log('Login failed - response not successful or no user data')
      
      // Fallback to demo authentication for development
      if (password === 'password123') {
        console.log('Falling back to demo authentication')
        const demoUser: User = {
          id: '1',
          username: usernameOrEmail,
          name: usernameOrEmail.includes('technician') ? 'Demo Technician' : 
                usernameOrEmail.includes('support') ? 'Demo Support Agent' :
                usernameOrEmail.includes('admin') ? 'Demo Admin' : 'Demo Customer',
          email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@example.com`,
          phone: '+1234567890',
          role: usernameOrEmail.includes('technician') ? 'technician' :
                usernameOrEmail.includes('support') ? 'supportAgent' :
                usernameOrEmail.includes('admin') ? 'admin' : 'customer',
          emailConfirmed: true,
          phoneNumberConfirmed: true,
          creationTime: new Date().toISOString(),
          creatorId: '1',
          lastModificationTime: new Date().toISOString(),
          lastModifierId: '1',
          isDeleted: false
        }
        
        setUser(demoUser)
        setSessionStatus('active')
        localStorage.setItem('demo_token', 'demo_auth_token')
        
        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem('remember_me', 'true')
          localStorage.setItem('remembered_user', usernameOrEmail)
        } else {
          localStorage.removeItem('remember_me')
          localStorage.removeItem('remembered_user')
        }
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const response = await apiClient.register(userData)
      
      if (response.success && response.data) {
        // Registration successful, but user needs to login
        return true
      }
      
      return false
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log('Starting logout process...')
      
      // Clear user state first to prevent any UI issues
      setUser(null)
      setSessionStatus('none')
      
      // Clear any session check interval
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval)
        setSessionCheckInterval(null)
      }
      
      // Call the API logout
      await apiClient.logout()
      
      console.log('Logout completed successfully')
      
      // Use a small delay to ensure all cleanup is done before redirect
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
      
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if logout fails, ensure we redirect
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
    }
  }

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const response = await apiClient.updateUser(userData)
      if (response.success && response.data) {
        setUser(response.data)
        return true
      }
      return false
    } catch (error) {
      console.error('Update user failed:', error)
      return false
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    sessionStatus,
    login,
    register,
    logout,
    updateUser,
    checkSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
