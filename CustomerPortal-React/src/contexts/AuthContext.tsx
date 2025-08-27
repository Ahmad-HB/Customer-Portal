import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { apiClient, type User, type RegisterRequest } from '@/lib/api-client'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (usernameOrEmail: string, password: string, rememberMe?: boolean) => Promise<boolean>
  register: (userData: RegisterRequest) => Promise<boolean>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = apiClient.getToken()
      const demoToken = localStorage.getItem('demo_token')
      
      if (token) {
        try {
          const response = await apiClient.getCurrentUser()
          if (response.success && response.data) {
            setUser(response.data)
          } else {
            // Token is invalid, clear it
            apiClient.logout()
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          apiClient.logout()
        }
      } else if (demoToken) {
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
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (usernameOrEmail: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log('Attempting login with:', { usernameOrEmail, rememberMe })
      
      // Real API authentication
      const response = await apiClient.login(usernameOrEmail, password)
      console.log('Login response:', response)
      
      if (response.success && response.data) {
        // Get user data after successful login
        const userResponse = await apiClient.getCurrentUser()
        console.log('User response:', userResponse)
        
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data)
          
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
    login,
    register,
    logout,
    updateUser,
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
