// API Client Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:44338'

// Log the current origin for debugging
console.log('Current origin:', window.location.origin)
console.log('API Base URL:', API_BASE_URL)

// ABP.IO specific types and interfaces
export interface AbpResponse<T> {
  data: T
  success: boolean
  error?: {
    code: string
    message: string
    details?: string
  }
  unAuthorizedRequest?: boolean
  __abp?: boolean
}

export interface AbpListResult<T> {
  items: T[]
  totalCount: number
}

export interface AbpPagedResult<T> extends AbpListResult<T> {
  pageSize: number
  currentPage: number
  totalPages: number
}

// ABP Entity base properties
export interface AbpEntity {
  id: string
  creationTime?: string
  creatorId?: string
  lastModificationTime?: string
  lastModifierId?: string
  isDeleted?: boolean
  deleterId?: string
  deletionTime?: string
}

// AppUser DTO interface based on backend enum
export interface AppUser extends AbpEntity {
  userName: string
  name: string
  email: string
  phoneNumber?: string
  userType: UserTypeValue
  emailConfirmed?: boolean
  phoneNumberConfirmed?: boolean
  lockoutEnabled?: boolean
  lockoutEnd?: string
}

// UserType enum matching backend
export const UserType = {
  Admin: 1,
  Customer: 2,
  SupportAgent: 3,
  Technician: 4
} as const

export type UserTypeValue = typeof UserType[keyof typeof UserType]

// Types for API responses
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface LoginResponse {
  access_token: string
  expires_in: number
  token_type: string
  refresh_token?: string
}

export interface User extends AbpEntity {
  username: string
  name: string
  surname?: string
  email: string
  phone: string
  password?: string // Only for registration
  role: 'customer' | 'technician' | 'supportAgent' | 'admin'
  emailConfirmed?: boolean
  phoneNumberConfirmed?: boolean
  lockoutEnabled?: boolean
  lockoutEnd?: string
}

// Registration request interface
export interface RegisterRequest {
  username: string
  name: string
  surname?: string
  email: string
  phone: string
  password: string
}

export interface Ticket extends AbpEntity {
  name: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  servicePlan: string
  assignedTo?: string
  customerId: string
  assignedTechnicianId?: string
  resolutionNotes?: string
  closedAt?: string
}

export interface ServicePlan extends AbpEntity {
  name: string
  description: string
  price: number
  status: 'active' | 'inactive'
  features?: string[]
  duration?: number // in months
  maxTicketsPerMonth?: number
}

export interface UserServicePlan extends AbpEntity {
  servicePlanId: string
  servicePlanName: string
  appUserId: string
  appUserName: string
  isActive: boolean
  isSuspended: boolean
  suspensionReason?: string
  startDate: string
  endDate: string
}

// ABP.IO API Client Class
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = localStorage.getItem('access_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers as Record<string, string>,
    }

    // Add token if available (for token-based auth)
    if (this.token && !this.token.startsWith('temp_')) {
      headers.Authorization = `Bearer ${this.token}`
    }

    // For session-based auth, cookies will be sent automatically
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Include cookies for session-based auth
    }

    try {
      const response = await fetch(url, fetchOptions)

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, redirect to login
          this.logout()
          throw new Error('Authentication required')
        }
        
        // Try to parse ABP error response
        try {
          const errorData = await response.json()
          if (errorData.error) {
            throw new Error(errorData.error.message || 'API Error')
          }
        } catch {
          // Fallback to generic error
        }
        
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      // Check if response has content
      const responseText = await response.text()
      
      // If response is empty (like 204 No Content), return success
      if (!responseText.trim()) {
        return { data: null as T, success: true, message: 'Operation completed successfully' }
      }
      
      // Try to parse JSON if there's content
      try {
        const data = JSON.parse(responseText)
        
        // Handle ABP response format
        if (data.__abp) {
          return { data: data.result || data, success: true }
        }
        
        return { data, success: true }
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError)
        return { 
          data: null as T, 
          success: false, 
          message: 'Invalid response format from server' 
        }
      }
    } catch (error) {
      console.error('API Request failed:', error)
      return {
        data: null as T,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Authentication (ABP Account)
  async login(usernameOrEmail: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const loginData = {
      userNameOrEmailAddress: usernameOrEmail,
      password: password,
      rememberMe: true
    }

    try {
      const response = await fetch(`${this.baseURL}/api/account/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginData),
        credentials: 'include' // Include cookies for session-based auth
      })

      console.log('Login response status:', response.status)
      console.log('Login response headers:', response.headers)

      if (!response.ok) {
        let errorMessage = 'Login failed'
        
        try {
          const errorData = await response.json()
          console.log('Login error data:', errorData)
          
          // Handle ABP.IO specific authorization errors
          if (errorData.error?.code === 'Volo.Authorization:010001') {
            errorMessage = 'Login endpoint requires proper authorization. Please check your ABP.IO configuration.'
          } else if (errorData.error?.message) {
            errorMessage = errorData.error.message
          }
        } catch (jsonError) {
          console.log('Could not parse error response as JSON')
          errorMessage = `Login failed with status ${response.status}`
        }
        
        return {
          data: null as unknown as LoginResponse,
          success: false,
          message: errorMessage
        }
      }

      let data
      try {
        const responseText = await response.text()
        console.log('Raw response text:', responseText)
        
        if (!responseText.trim()) {
          console.log('Empty response, treating as successful login')
          const tempToken = `temp_${Date.now()}`
          this.setToken(tempToken)
          
          return { 
            data: {
              access_token: tempToken,
              expires_in: 3600,
              token_type: 'Bearer'
            }, 
            success: true 
          }
        }
        
        data = JSON.parse(responseText)
        console.log('Login success data:', data)
      } catch (jsonError) {
        console.log('Could not parse success response as JSON:', jsonError)
        // If we can't parse JSON but status is OK, treat as successful login
        const tempToken = `temp_${Date.now()}`
        this.setToken(tempToken)
        
        return { 
          data: {
            access_token: tempToken,
            expires_in: 3600,
            token_type: 'Bearer'
          }, 
          success: true 
        }
      }
      
      // Handle ABP.IO login response format
      if (data.result === 1 && data.description === "Success") {
        // Login successful, but we need to get user data separately
        // For now, we'll create a temporary token for session management
        const tempToken = `temp_${Date.now()}`
        this.setToken(tempToken)
        
        return { 
          data: {
            access_token: tempToken,
            expires_in: 3600,
            token_type: 'Bearer'
          }, 
          success: true 
        }
      }
      
      // If we get here, the response format is unexpected
      console.log('Unexpected login response format:', data)
      return { data: null as unknown as LoginResponse, success: false, message: 'Unexpected response format' }
    } catch (error) {
      console.error('Login request failed:', error)
      return {
        data: null as unknown as LoginResponse,
        success: false,
        message: error instanceof Error ? error.message : 'Network error during login'
      }
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('Calling logout API endpoint:', `${this.baseURL}/api/account/logout`)
      
      // Call the ABP.IO logout endpoint
      const response = await fetch(`${this.baseURL}/api/account/logout`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        },
        credentials: 'include' // Include cookies for session-based auth
      })

      console.log('Logout response status:', response.status)
      console.log('Logout response headers:', response.headers)
      
      if (response.ok) {
        console.log('Logout API call successful')
      } else {
        console.log('Logout API call failed with status:', response.status)
        
        // Try to get error details
        try {
          const errorText = await response.text()
          console.log('Logout error response:', errorText)
        } catch (textError) {
          console.log('Could not read error response text')
        }
      }
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      console.log('Clearing local storage and session data...')
      
      // Always clear local state regardless of API response
      this.token = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      localStorage.removeItem('demo_token')
      localStorage.removeItem('remember_me')
      localStorage.removeItem('remembered_user')
      
      // Clear any other potential auth-related items
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('token_expires')
      
      // Clear session storage as well
      sessionStorage.clear()
      
      console.log('Local storage and session cleared successfully')
    }
  }

  setToken(token: string): void {
    this.token = token
    localStorage.setItem('access_token', token)
  }

  getToken(): string | null {
    // Try to get token from localStorage if not in memory
    if (!this.token) {
      this.token = localStorage.getItem('access_token')
    }
    console.log('Current token:', this.token ? 'Token exists' : 'No token')
    return this.token
  }

  // User Management (ABP Account)
  // Get current app user from the new endpoint
  async getCurrentAppUser(): Promise<ApiResponse<AppUser>> {
    try {
      const response = await fetch(`${this.baseURL}/api/app/app-user/current-app-user`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        let errorMessage = 'Failed to get app user profile'
        
        try {
          const errorData = await response.json()
          
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          }
        } catch (jsonError) {
          errorMessage = `Failed to get app user profile with status ${response.status}`
        }
        
        return {
          data: null as unknown as AppUser,
          success: false,
          message: errorMessage
        }
      }

      try {
        const data = await response.json()
        
        const appUser: AppUser = {
          id: data.id || 'user-id',
          userName: data.userName,
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          userType: data.userType,
          emailConfirmed: data.emailConfirmed ?? true,
          phoneNumberConfirmed: data.phoneNumberConfirmed ?? true,
          creationTime: data.creationTime || new Date().toISOString(),
          creatorId: data.creatorId || data.id || 'user-id',
          lastModificationTime: data.lastModificationTime || new Date().toISOString(),
          lastModifierId: data.lastModifierId || data.id || 'user-id',
          isDeleted: data.isDeleted || false
        }
        
        return {
          data: appUser,
          success: true,
          message: 'App user profile retrieved successfully'
        }
      } catch (jsonError) {
        console.error('Could not parse app user response as JSON:', jsonError)
        return {
          data: null as unknown as AppUser,
          success: false,
          message: 'Invalid app user profile response'
        }
      }
    } catch (error) {
      console.error('Get current app user request failed:', error)
      return {
        data: null as unknown as AppUser,
        success: false,
        message: error instanceof Error ? error.message : 'Network error getting app user profile'
      }
    }
  }

  // Get current user role from the dedicated role endpoint
  async getCurrentUserRole(): Promise<ApiResponse<{ role: string; userType: number }>> {
    try {
      const response = await fetch(`${this.baseURL}/api/app/app-user/currnt-user-role`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        let errorMessage = 'Failed to get user role'
        
        try {
          const errorData = await response.json()
          
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          }
        } catch (jsonError) {
          errorMessage = `Failed to get user role with status ${response.status}`
        }
        
        return {
          data: null as unknown as { role: string; userType: number },
          success: false,
          message: errorMessage
        }
      }

      try {
        const data = await response.json()
        
        // Handle the string response from the new API endpoint
        // The API returns "admin", "customer", "technician", "supportAgent"
        let roleData: { role: string; userType: number }
        
        if (typeof data === 'string') {
          // API returned just a string like "admin"
          const role = data.toLowerCase()
          const roleToUserType: Record<string, number> = {
            'admin': 1,
            'customer': 2,
            'supportAgent': 3,
            'technician': 4
          }
          roleData = {
            role: data, // Keep the original string
            userType: roleToUserType[role] || 2 // Default to customer if unknown
          }
        } else if (data.role) {
          // API returned an object with role property
          roleData = {
            role: data.role,
            userType: data.userType || 2
          }
        } else {
          // Fallback
          roleData = {
            role: 'customer',
            userType: 2
          }
        }
        
        return {
          data: roleData,
          success: true,
          message: 'User role retrieved successfully'
        }
      } catch (jsonError) {
        console.error('Could not parse user role response as JSON:', jsonError)
        return {
          data: null as unknown as { role: string; userType: number },
          success: false,
          message: 'Invalid user role response'
        }
      }
    } catch (error) {
      console.error('Get current user role request failed:', error)
      return {
        data: null as unknown as { role: string; userType: number },
        success: false,
        message: error instanceof Error ? error.message : 'Network error getting user role'
      }
    }
  }

  // User Management (ABP Account) - Legacy method for backward compatibility
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      // First try to get the app user from the new endpoint
      const appUserResponse = await this.getCurrentAppUser()
      
      if (appUserResponse.success && appUserResponse.data) {
        // Map the AppUser DTO response to our User interface
        // Determine user role from the userType enum
        let userRole: 'customer' | 'technician' | 'supportAgent' | 'admin' = 'customer'
        
        // Map the numeric userType to our role string
        console.log('Raw userType from API:', appUserResponse.data.userType)
        console.log('UserType constants:', UserType)
        
        // Handle potential type mismatches - convert to number if it's a string
        let userTypeValue: number = appUserResponse.data.userType
        if (typeof userTypeValue === 'string') {
          userTypeValue = parseInt(userTypeValue, 10)
          console.log('Converted string userType to number:', userTypeValue)
        }
        
        console.log('Comparing userType with UserType.Technician:', userTypeValue === UserType.Technician)
        
        switch (userTypeValue) {
          case UserType.Admin:
            userRole = 'admin'
            console.log('Role mapped to admin')
            break
          case UserType.SupportAgent:
            userRole = 'supportAgent'
            console.log('Role mapped to supportAgent')
            break
          case UserType.Technician:
            userRole = 'technician'
            console.log('Role mapped to technician')
            break
          case UserType.Customer:
            userRole = 'customer'
            console.log('Role mapped to customer')
            break
          default:
            userRole = 'customer'
            console.log('Role mapped to customer (default)')
            break
        }
        
        console.log('Final extracted user role:', userRole, 'from userType:', appUserResponse.data.userType)
        
        const user: User = {
          id: appUserResponse.data.id,
          username: appUserResponse.data.userName,
          name: appUserResponse.data.name,
          email: appUserResponse.data.email,
          phone: appUserResponse.data.phoneNumber || '',
          role: userRole,
          emailConfirmed: appUserResponse.data.emailConfirmed ?? true,
          phoneNumberConfirmed: appUserResponse.data.phoneNumberConfirmed ?? true,
          creationTime: appUserResponse.data.creationTime || new Date().toISOString(),
          creatorId: appUserResponse.data.creatorId || appUserResponse.data.id,
          lastModificationTime: appUserResponse.data.lastModificationTime || new Date().toISOString(),
          lastModifierId: appUserResponse.data.lastModifierId || appUserResponse.data.id,
          isDeleted: appUserResponse.data.isDeleted || false
        }
        
        return {
          data: user,
          success: true,
          message: 'User profile retrieved successfully'
        }
      }
      
      // Fallback to legacy endpoint if new endpoint fails
      console.log('Falling back to legacy endpoint: /api/account/my-profile')
      const response = await fetch(`${this.baseURL}/api/account/my-profile`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      console.log('Get current user response status:', response.status)

      if (!response.ok) {
        let errorMessage = 'Failed to get user profile'
        
        try {
          const errorData = await response.json()
          console.log('Get user error data:', errorData)
          
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          }
        } catch (jsonError) {
          console.log('Could not parse error response as JSON')
          errorMessage = `Failed to get user profile with status ${response.status}`
        }
        
        return {
          data: null as unknown as User,
          success: false,
          message: errorMessage
        }
      }

      try {
        const data = await response.json()
        console.log('Get current user success data:', data)
        
        // Map the ABP.io user response to our User interface
        // Determine user role from the response data
        let userRole: 'customer' | 'technician' | 'supportAgent' | 'admin' = 'customer'
        
        // Check for roles in different possible locations in the ABP response
        if (data.roles && Array.isArray(data.roles)) {
          // Check for specific role names
          if (data.roles.includes('admin') || data.roles.includes('Admin')) {
            userRole = 'admin'
          } else if (data.roles.includes('support') || data.roles.includes('Support') || data.roles.includes('supportAgent') || data.roles.includes('SupportAgent')) {
            userRole = 'supportAgent'
          } else if (data.roles.includes('technician') || data.roles.includes('Technician')) {
            userRole = 'technician'
          }
        } else if (data.role) {
          // Single role field
          const role = data.role.toLowerCase()
          if (role.includes('admin')) {
            userRole = 'admin'
          } else if (role.includes('support')) {
            userRole = 'supportAgent'
          } else if (role.includes('technician')) {
            userRole = 'technician'
          }
        } else if (data.claims && Array.isArray(data.claims)) {
          // Check claims for role information
          const roleClaim = data.claims.find((claim: any) => 
            claim.type === 'role' || claim.claimType === 'role' || 
            claim.type === 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          )
          if (roleClaim && roleClaim.value) {
            const role = roleClaim.value.toLowerCase()
            if (role.includes('admin')) {
              userRole = 'admin'
            } else if (role.includes('support')) {
              userRole = 'supportAgent'
            } else if (role.includes('technician')) {
              userRole = 'technician'
            }
          }
        }
        
        console.log('Extracted user role:', userRole, 'from data:', data)
        
        const user: User = {
          id: data.id || 'user-id',
          username: data.userName,
          name: data.name,
          email: data.email,
          phone: data.phoneNumber,
          role: userRole,
          emailConfirmed: data.emailConfirmed ?? true,
          phoneNumberConfirmed: data.phoneNumberConfirmed ?? true,
          creationTime: data.creationTime || new Date().toISOString(),
          creatorId: data.creatorId || data.id || 'user-id',
          lastModificationTime: data.lastModificationTime || new Date().toISOString(),
          lastModifierId: data.lastModifierId || data.id || 'user-id',
          isDeleted: data.isDeleted || false
        }
        
        return {
          data: user,
          success: true,
          message: 'User profile retrieved successfully'
        }
      } catch (jsonError) {
        console.error('Could not parse user response as JSON:', jsonError)
        return {
          data: null as unknown as User,
          success: false,
          message: 'Invalid user profile response'
        }
      }
    } catch (error) {
      console.error('Get current user request failed:', error)
      return {
        data: null as unknown as User,
        success: false,
        message: error instanceof Error ? error.message : 'Network error getting user profile'
      }
    }
  }

  async updateUser(userData: Partial<User> & { surname?: string; concurrencyStamp?: string }): Promise<ApiResponse<User>> {
    // Map frontend User fields to backend API structure
    const updatePayload = {
      userName: userData.username,
      email: userData.email,
      name: userData.name,
      surname: userData.surname || '',
      phoneNumber: userData.phone,
      concurrencyStamp: userData.concurrencyStamp || ''
    }

    try {
      const result = await this.request<User>('/api/account/my-profile', {
        method: 'PUT',
        body: JSON.stringify(updatePayload)
      })

      console.log('Update user result:', result)

      if (result.success) {
        return {
          data: result.data || userData as User,
          success: true,
          message: 'Profile updated successfully'
        }
      } else {
        return {
          data: null as unknown as User,
          success: false,
          message: result.message || 'Profile update failed'
        }
      }
      
    } catch (error) {
      console.error('Update user failed:', error)
      return {
        data: null as unknown as User,
        success: false,
        message: error instanceof Error ? error.message : 'Network error updating profile'
      }
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    // New registration API structure
    const registerPayload = {
      userName: userData.username,
      emailAddress: userData.email,
      password: userData.password,
      appName: "CustomerPortal", // Adding appName as it might be required
      name: userData.name,
      phoneNumber: userData.phone
    }

    try {
      console.log('🔍 [Register] Sending registration request with payload:', registerPayload)
      console.log('🔍 [Register] Request URL:', `${this.baseURL}/api/app/custom-account/register-with-phone`)
      
      const response = await fetch(`${this.baseURL}/api/app/custom-account/register-with-phone`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(registerPayload),
        credentials: 'include'
      })

      console.log('Register response status:', response.status)

      if (!response.ok) {
        let errorMessage = 'Registration failed'
        
        try {
          const errorData = await response.json()
          console.log('Register error data:', errorData)
          console.log('Register request payload:', registerPayload)
          
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          } else if (errorData.error?.details) {
            errorMessage = errorData.error.details
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.details) {
            errorMessage = errorData.details
          }
        } catch (jsonError) {
          console.log('Could not parse error response as JSON')
          const errorText = await response.text()
          console.log('Raw error response:', errorText)
          errorMessage = `Registration failed with status ${response.status}: ${errorText}`
        }
        
        return {
          data: null as unknown as User,
          success: false,
          message: errorMessage
        }
      }

      let data
      try {
        const responseText = await response.text()
        console.log('Raw register response text:', responseText)
        
        if (!responseText.trim()) {
          console.log('Empty response, treating as successful registration')
          return { 
            data: null as unknown as User,
            success: true,
            message: 'Registration successful'
          }
        }
        
        data = JSON.parse(responseText)
        console.log('Register success data:', data)
      } catch (jsonError) {
        console.log('Could not parse success response as JSON:', jsonError)
        return { 
          data: null as unknown as User,
          success: true,
          message: 'Registration successful'
        }
      }
      
      // Handle ABP.IO registration response format
      // The API returns user data directly, not wrapped in result
      if (data.id) {
        // Registration successful, return user data
        const user: User = {
          id: data.id,
          username: data.userName,
          name: data.name || userData.name, // Use API response name or fallback to form data
          email: data.email,
          phone: data.phoneNumber || userData.phone, // Use API response phone or fallback to form data
          role: 'customer',
          emailConfirmed: data.emailConfirmed || false,
          phoneNumberConfirmed: data.phoneNumberConfirmed || false,
          creationTime: data.creationTime || new Date().toISOString()
        }
        
        return { 
          data: user,
          success: true,
          message: 'Registration successful'
        }
      }
      
      return { 
        data: null as unknown as User,
        success: true,
        message: 'Registration successful'
      }
    } catch (error) {
      console.error('Registration request failed:', error)
      return {
        data: null as unknown as User,
        success: false,
        message: error instanceof Error ? error.message : 'Network error during registration'
      }
    }
  }

  // Admin user creation API
  async adminCreateUser(userData: RegisterRequest & { userType: number }): Promise<ApiResponse<User>> {
    const registerPayload = {
      userName: userData.username,
      emailAddress: userData.email,
      password: userData.password,
      appName: "CustomerPortal", // Adding appName as it might be required
      name: userData.name,
      phoneNumber: userData.phone,
      userType: userData.userType
    }

    try {
      const response = await fetch(`${this.baseURL}/api/app/custom-account/admin-register-user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(registerPayload),
        credentials: 'include'
      })

      console.log('Admin create user response status:', response.status)

      if (!response.ok) {
        let errorMessage = 'User creation failed'
        
        try {
          const errorData = await response.json()
          console.log('Admin create user error data:', errorData)
          
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          } else if (errorData.error?.details) {
            errorMessage = errorData.error.details
          }
        } catch (jsonError) {
          console.log('Could not parse error response as JSON')
          errorMessage = `User creation failed with status ${response.status}`
        }
        
        return {
          data: null as unknown as User,
          success: false,
          message: errorMessage
        }
      }

      let data
      try {
        const responseText = await response.text()
        console.log('Raw admin create user response text:', responseText)
        
        if (!responseText.trim()) {
          console.log('Empty response, treating as successful user creation')
          return { 
            data: null as unknown as User,
            success: true,
            message: 'User created successfully'
          }
        }
        
        data = JSON.parse(responseText)
        console.log('Admin create user success data:', data)
      } catch (jsonError) {
        console.log('Could not parse success response as JSON:', jsonError)
        return { 
          data: null as unknown as User,
          success: true,
          message: 'User created successfully'
        }
      }
      
      // Handle successful user creation
      if (data && data.id) {
        const user: User = {
          id: data.id,
          username: data.userName || userData.username,
          name: data.name || userData.name,
          email: data.email || userData.email,
          phone: data.phoneNumber || userData.phone,
          role: userData.userType === 1 ? 'admin' : 
                userData.userType === 2 ? 'customer' :
                userData.userType === 3 ? 'supportAgent' : 'technician',
          emailConfirmed: false,
          phoneNumberConfirmed: false,
          creationTime: new Date().toISOString()
        }
        
        return { 
          data: user,
          success: true,
          message: 'User created successfully'
        }
      }
      
      return { 
        data: null as unknown as User,
        success: true,
        message: 'User created successfully'
      }
    } catch (error) {
      console.error('Admin create user request failed:', error)
      return {
        data: null as unknown as User,
        success: false,
        message: error instanceof Error ? error.message : 'Network error during user creation'
      }
    }
  }

  // ABP Application Services
  async getTickets(_params?: {
    skipCount?: number
    maxResultCount?: number
    sorting?: string
    filter?: string
  }): Promise<ApiResponse<AbpPagedResult<Ticket>>> {
    // The backend returns List<PagedResultDto<SupportTicketDto>>, not a paged result
    // So we need to handle this differently
    try {
      // Try different possible endpoints based on ABP.io conventions
      const endpoints = [
        '/api/app/support-ticket/support-tickets',
        '/api/app/support-ticket',
        '/api/app/support-tickets',
        '/api/app/ticket',
        '/api/app/tickets'
      ]

      let response
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`)
          response = await this.request<any>(endpoint)
          if (response.success) {
            console.log(`Success with endpoint: ${endpoint}`)
            break
          }
        } catch (error) {
          console.log(`Failed with endpoint: ${endpoint}`, error)
        }
      }

      if (response && response.success && response.data) {
        console.log('Tickets response data:', response.data)
        
        // Handle different response structures
        let items = []
        if (Array.isArray(response.data)) {
          items = response.data
        } else if (response.data.items && Array.isArray(response.data.items)) {
          items = response.data.items
        } else if (response.data.result && Array.isArray(response.data.result)) {
          items = response.data.result
        } else {
          console.log('Unexpected response structure:', response.data)
          items = []
        }
        
        // Convert the list to a paged result format
        const tickets = items.map((item: any) => ({
          id: item.id,
          name: item.subject,
          description: item.description,
          status: item.status?.toLowerCase().replace(' ', '_'),
          priority: item.priority?.toLowerCase(),
          servicePlan: item.servicePlanName,
          customerId: item.appUserId,
          assignedTechnicianId: item.technicianId,
          resolutionNotes: '',
          closedAt: item.resolvedAt,
          creationTime: item.createdAt,
          creatorId: item.appUserId,
          lastModificationTime: item.lastModificationTime,
          lastModifierId: item.lastModifierId,
          isDeleted: item.isDeleted
        }))
        
        return {
          data: {
            items: tickets,
            totalCount: tickets.length,
            pageSize: tickets.length,
            currentPage: 1,
            totalPages: 1
          },
          success: true
        }
      }
      
      // If no endpoint worked, return empty result
      console.log('No working endpoint found for tickets')
      return {
        data: { items: [], totalCount: 0, pageSize: 0, currentPage: 1, totalPages: 0 },
        success: false,
        message: 'No working endpoint found for tickets'
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      return {
        data: { items: [], totalCount: 0, pageSize: 0, currentPage: 1, totalPages: 0 },
        success: false,
        message: 'Failed to fetch tickets'
      }
    }
  }

  async getTicket(id: string): Promise<ApiResponse<Ticket>> {
    return this.request<Ticket>(`/api/app/support-ticket/support-ticket/${id}`)
  }

  async createTicket(ticketData: Omit<Ticket, 'id' | 'creationTime' | 'creatorId'>): Promise<ApiResponse<Ticket>> {
    try {
      // Map the frontend ticket data to backend DTO format
      const createTicketDto = {
        subject: ticketData.name,
        description: ticketData.description,
        servicePlanId: ticketData.servicePlan // This should be the service plan ID
      }
      
      const response = await fetch(`${this.baseURL}/api/app/support-ticket/support-ticket`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(createTicketDto),
        credentials: 'include'
      })

      console.log('Create ticket response status:', response.status)

      if (!response.ok) {
        let errorMessage = 'Failed to create ticket'
        
        try {
          const errorData = await response.json()
          console.log('Create ticket error data:', errorData)
          
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          }
        } catch (jsonError) {
          console.log('Could not parse error response as JSON')
          errorMessage = `Failed to create ticket with status ${response.status}`
        }
        
        return {
          data: null as unknown as Ticket,
          success: false,
          message: errorMessage
        }
      }

      // Handle 204 No Content (successful creation)
      if (response.status === 204) {
        console.log('Ticket created successfully (204 No Content)')
        return { 
          data: null as unknown as Ticket,
          success: true,
          message: 'Ticket created successfully'
        }
      }

      // Try to parse response as JSON for other success cases
      try {
        const responseText = await response.text()
        console.log('Raw create ticket response text:', responseText)
        
        if (!responseText.trim()) {
          console.log('Empty response, treating as successful creation')
          return { 
            data: null as unknown as Ticket,
            success: true,
            message: 'Ticket created successfully'
          }
        }
        
        const data = JSON.parse(responseText)
        console.log('Create ticket success data:', data)
        
        return { 
          data: data,
          success: true,
          message: 'Ticket created successfully'
        }
      } catch (jsonError) {
        console.log('Could not parse success response as JSON:', jsonError)
        return { 
          data: null as unknown as Ticket,
          success: true,
          message: 'Ticket created successfully'
        }
      }
    } catch (error) {
      console.error('Create ticket request failed:', error)
      return {
        data: null as unknown as Ticket,
        success: false,
        message: error instanceof Error ? error.message : 'Network error during ticket creation'
      }
    }
  }

  async updateTicket(id: string, ticketData: Partial<Ticket>): Promise<ApiResponse<Ticket>> {
    const updateTicketDto = {
      subject: ticketData.name,
      description: ticketData.description,
      priority: ticketData.priority?.toUpperCase(),
      status: ticketData.status?.toUpperCase().replace('_', ' ')
    }
    
    return this.request<Ticket>(`/api/app/support-ticket/support-ticket/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateTicketDto),
    })
  }

  async deleteTicket(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/app/support-ticket/support-ticket/${id}`, {
      method: 'DELETE',
    })
  }

  // User Service Plans (User Subscriptions)
  async getUserServicePlans(_params?: {
    skipCount?: number
    maxResultCount?: number
    sorting?: string
    filter?: string
  }): Promise<ApiResponse<AbpPagedResult<UserServicePlan>>> {
    try {
      // Try different possible endpoints based on ABP.io conventions
      const endpoints = [
        '/api/app/user-service-plan/user-service-plans',
        '/api/app/user-service-plan',
        '/api/app/user-service-plans',
        '/api/app/user-subscription',
        '/api/app/user-subscriptions'
      ]

      let response
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`)
          response = await this.request<any>(endpoint)
          if (response.success) {
            console.log(`Success with endpoint: ${endpoint}`)
            break
          }
        } catch (error) {
          console.log(`Failed with endpoint: ${endpoint}`, error)
        }
      }

      if (response && response.success && response.data) {
        console.log('User service plans response data:', response.data)
        
        // Handle different response structures
        let items = []
        if (Array.isArray(response.data)) {
          items = response.data
        } else if (response.data.items && Array.isArray(response.data.items)) {
          items = response.data.items
        } else if (response.data.result && Array.isArray(response.data.result)) {
          items = response.data.result
        } else {
          console.log('Unexpected response structure:', response.data)
          items = []
        }
        
        // Convert the list to a paged result format
        const userServicePlans = items.map((item: any) => ({
          id: item.id,
          servicePlanId: item.servicePlanId,
          servicePlanName: item.servicePlanName,
          appUserId: item.appUserId,
          appUserName: item.appUserName,
          isActive: item.isActive,
          isSuspended: item.isSuspended,
          suspensionReason: item.suspensionReason,
          startDate: item.startDate,
          endDate: item.endDate,
          creationTime: item.creationTime,
          creatorId: item.creatorId,
          lastModificationTime: item.lastModificationTime,
          lastModifierId: item.lastModifierId,
          isDeleted: item.isDeleted
        }))
        
        return {
          data: {
            items: userServicePlans,
            totalCount: userServicePlans.length,
            pageSize: userServicePlans.length,
            currentPage: 1,
            totalPages: 1
          },
          success: true
        }
      }
      
      // If no endpoint worked, return empty result
      console.log('No working endpoint found for user service plans')
      return {
        data: { items: [], totalCount: 0, pageSize: 0, currentPage: 1, totalPages: 0 },
        success: false,
        message: 'No working endpoint found for user service plans'
      }
    } catch (error) {
      console.error('Error fetching user service plans:', error)
      return {
        data: { items: [], totalCount: 0, pageSize: 0, currentPage: 1, totalPages: 0 },
        success: false,
        message: 'Failed to fetch user service plans'
      }
    }
  }


  // Service Plans
  async getServicePlans(_params?: {
    skipCount?: number
    maxResultCount?: number
    sorting?: string
    filter?: string
  }): Promise<ApiResponse<AbpPagedResult<ServicePlan>>> {
    try {
      // Try different possible endpoints based on ABP.io conventions
      const endpoints = [
        '/api/app/service-plan/service-plans',
        '/api/app/service-plan',
        '/api/app/service-plans',
        '/api/app/plan',
        '/api/app/plans'
      ]

      let response
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`)
          response = await this.request<any>(endpoint)
          if (response.success) {
            console.log(`Success with endpoint: ${endpoint}`)
            break
          }
        } catch (error) {
          console.log(`Failed with endpoint: ${endpoint}`, error)
        }
      }

      if (response && response.success && response.data) {
        console.log('Service plans response data:', response.data)
        
        // Handle different response structures
        let items = []
        if (Array.isArray(response.data)) {
          items = response.data
        } else if (response.data.items && Array.isArray(response.data.items)) {
          items = response.data.items
        } else if (response.data.result && Array.isArray(response.data.result)) {
          items = response.data.result
        } else {
          console.log('Unexpected response structure:', response.data)
          items = []
        }
        
        // Convert the list to a paged result format
        const servicePlans = items.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          status: item.status?.toLowerCase() || 'active',
          duration: 12, // Default duration
          maxTicketsPerMonth: 10, // Default value
          creationTime: item.creationTime,
          creatorId: item.creatorId,
          lastModificationTime: item.lastModificationTime,
          lastModifierId: item.lastModifierId,
          isDeleted: item.isDeleted
        }))
        
        return {
          data: {
            items: servicePlans,
            totalCount: servicePlans.length,
            pageSize: servicePlans.length,
            currentPage: 1,
            totalPages: 1
          },
          success: true
        }
      }
      
      // If no endpoint worked, return empty result
      console.log('No working endpoint found for service plans')
      return {
        data: { items: [], totalCount: 0, pageSize: 0, currentPage: 1, totalPages: 0 },
        success: false,
        message: 'No working endpoint found for service plans'
      }
    } catch (error) {
      console.error('Error fetching service plans:', error)
      return {
        data: { items: [], totalCount: 0, pageSize: 0, currentPage: 1, totalPages: 0 },
        success: false,
        message: 'Failed to fetch service plans'
      }
    }
  }

  async getServicePlan(id: string): Promise<ApiResponse<ServicePlan>> {
    return this.request<ServicePlan>(`/api/app/service-plan/${id}`)
  }

  async subscribeToServicePlan(servicePlanId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseURL}/api/app/service-plan/subcribe-to-service-plan/${servicePlanId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      console.log('Subscribe response status:', response.status)

      if (!response.ok) {
        let errorMessage = 'Subscription failed'
        
        try {
          const errorData = await response.json()
          console.log('Subscribe error data:', errorData)
          
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          }
        } catch (jsonError) {
          console.log('Could not parse error response as JSON')
          errorMessage = `Subscription failed with status ${response.status}`
        }
        
        return {
          data: null as unknown as void,
          success: false,
          message: errorMessage
        }
      }

      // Try to parse response as JSON, but don't fail if it's empty or not JSON
      let data
      try {
        const responseText = await response.text()
        console.log('Raw subscribe response text:', responseText)
        
        if (!responseText.trim()) {
          console.log('Empty response, treating as successful subscription')
          return { 
            data: null as unknown as void,
            success: true,
            message: 'Subscription successful'
          }
        }
        
        data = JSON.parse(responseText)
        console.log('Subscribe success data:', data)
      } catch (jsonError) {
        console.log('Could not parse success response as JSON:', jsonError)
        // If we can't parse JSON but status is OK, treat as successful subscription
        return { 
          data: null as unknown as void,
          success: true,
          message: 'Subscription successful'
        }
      }
      
      return { 
        data: null as unknown as void,
        success: true,
        message: 'Subscription successful'
      }
    } catch (error) {
      console.error('Subscription request failed:', error)
      return {
        data: null as unknown as void,
        success: false,
        message: error instanceof Error ? error.message : 'Network error during subscription'
      }
    }
  }

  // Technician specific
  async getAssignedTickets(params?: {
    skipCount?: number
    maxResultCount?: number
    sorting?: string
  }): Promise<ApiResponse<AbpPagedResult<Ticket>>> {
    const queryParams = new URLSearchParams()
    if (params?.skipCount) queryParams.append('SkipCount', params.skipCount.toString())
    if (params?.maxResultCount) queryParams.append('MaxResultCount', params.maxResultCount.toString())
    if (params?.sorting) queryParams.append('Sorting', params.sorting)
    
    const query = queryParams.toString()
    const endpoint = query ? `/api/app/technician/assigned-tickets?${query}` : '/api/app/technician/assigned-tickets'
    return this.request<AbpPagedResult<Ticket>>(endpoint)
  }

  async updateTicketStatus(ticketId: string, status: Ticket['status'], notes?: string): Promise<ApiResponse<Ticket>> {
    return this.request<Ticket>(`/api/app/technician/ticket/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, resolutionNotes: notes }),
    })
  }

  async submitTechnicianReport(ticketId: string, workPerformed: string): Promise<ApiResponse<Blob>> {
    const queryParams = new URLSearchParams()
    queryParams.append('workPerformed', workPerformed)
    
    const query = queryParams.toString()
    const endpoint = `/api/app/report/generate-technician-report/${ticketId}?${query}`
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const pdfBlob = await response.blob()
      
      // Trigger download
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `TechnicianReport_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return {
        success: true,
        data: pdfBlob,
        message: 'Report generated and downloaded successfully'
      }
    } catch (error) {
      console.error('Error generating technician report:', error)
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : 'Failed to generate report'
      }
    }
  }

  // Get Support Tickets
  async getSupportTickets(): Promise<ApiResponse<{
    items: Array<{
      id: string;
      creationTime: string;
      creatorId: string;
      lastModificationTime: string;
      lastModifierId: string;
      isDeleted: boolean;
      deleterId?: string;
      deletionTime?: string;
      appUserId: string;
      appUserName: string;
      supportagentId?: string;
      supportagentName?: string;
      technicianId?: string;
      identityUserName: string;
      servicePlanId: string;
      servicePlanName: string;
      subject: string;
      description: string;
      priority: number;
      status: number;
      createdAt: string;
      resolvedAt?: string;
    }>;
    totalCount: number;
  }>> {
    try {
      console.log('🔍 [Support Tickets] Fetching from: /api/app/support-ticket/support-tickets')
      console.log('🔍 [Support Tickets] Full URL:', `${this.baseURL}/api/app/support-ticket/support-tickets`)
      
      const response = await fetch(`${this.baseURL}/api/app/support-ticket/support-tickets`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      console.log('🔍 [Support Tickets] Response status:', response.status)
      console.log('🔍 [Support Tickets] Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let errorMessage = 'Failed to fetch support tickets'
        let shouldReturnEmpty = false
        
        try {
          const errorData = await response.json()
          console.log('Get support tickets error data:', errorData)
          
          // Check if this is a "no tickets found" scenario vs a real error
          if (response.status === 500) {
            // For 500 errors, check if it's actually a "no data" response
            if (errorData.error?.message?.toLowerCase().includes('not found') ||
                errorData.error?.message?.toLowerCase().includes('no tickets') ||
                errorData.error?.message?.toLowerCase().includes('empty') ||
                errorData.message?.toLowerCase().includes('not found') ||
                errorData.message?.toLowerCase().includes('no tickets') ||
                errorData.message?.toLowerCase().includes('empty')) {
              console.log('No tickets found for user - treating as empty result')
              shouldReturnEmpty = true
            }
          }
          
          if (!shouldReturnEmpty) {
            if (errorData.error?.message) {
              errorMessage = errorData.error.message
            } else if (errorData.error?.details) {
              errorMessage = errorData.error.details
            } else if (errorData.message) {
              errorMessage = errorData.message
            } else if (errorData.details) {
              errorMessage = errorData.details
            }
          }
        } catch (jsonError) {
          console.log('Could not parse error response as JSON')
          const errorText = await response.text()
          console.log('Raw error response:', errorText)
          
          // Check if the raw text suggests "no data"
          if (response.status === 500 && (
              errorText.toLowerCase().includes('not found') ||
              errorText.toLowerCase().includes('no tickets') ||
              errorText.toLowerCase().includes('empty') ||
              errorText === '' ||
              errorText === 'null'
            )) {
            console.log('No tickets found for user (raw text) - treating as empty result')
            shouldReturnEmpty = true
          } else {
            errorMessage = `Failed to fetch support tickets with status ${response.status}: ${errorText}`
          }
        }
        
        if (shouldReturnEmpty) {
          // Return empty result instead of error
          return {
            data: { items: [], totalCount: 0 },
            success: true,
            message: 'No tickets found'
          }
        }
        
        return {
          data: { items: [], totalCount: 0 },
          success: false,
          message: errorMessage
        }
      }

      const data = await response.json()
      console.log('🔍 [Support Tickets] Success data:', data)
      console.log('🔍 [Support Tickets] Data type:', typeof data)
      console.log('🔍 [Support Tickets] Is array:', Array.isArray(data))
      
      // Handle different response structures
      let ticketsData = data
      
      if (Array.isArray(data)) {
        if (data.length === 0) {
          // Empty array - no tickets
          ticketsData = { items: [], totalCount: 0 }
        } else if (data.length === 1 && data[0].items) {
          // Array with one object containing items
          ticketsData = data[0]
        } else {
          // Array of ticket objects directly
          ticketsData = { items: data, totalCount: data.length }
        }
      } else if (data && typeof data === 'object') {
        // Object response
        if (data.items) {
          ticketsData = data
        } else {
          // Single ticket object
          ticketsData = { items: [data], totalCount: 1 }
        }
      } else {
        // Unexpected response format
        console.log('🔍 [Support Tickets] Unexpected response format, treating as empty')
        ticketsData = { items: [], totalCount: 0 }
      }
      
      console.log('🔍 [Support Tickets] Processed tickets data:', ticketsData)
      
      return { 
        data: ticketsData,
        success: true,
        message: 'Support tickets fetched successfully'
      }
    } catch (error) {
      console.error('Get support tickets error:', error)
      return {
        data: { items: [], totalCount: 0 },
        success: false,
        message: 'Failed to fetch support tickets'
      }
    }
  }

  async assignTicket(ticketId: string, technicianId: string): Promise<ApiResponse<Ticket>> {
    return this.request<Ticket>(`/api/app/support/ticket/${ticketId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ technicianId }),
    })
  }

  async assignTechnicianToTicket(supportTicketId: string, technicianId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/app/support-ticket/assign-technician?supportTicketId=${supportTicketId}&technicianId=${technicianId}`, {
      method: 'POST',
    })
  }

  async generateSupportAgentTicketReport(ticketId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/api/app/report/generate-support-agent-ticket-report/${ticketId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/pdf',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.status}`)
    }

    return response.blob()
  }

  async generateSupportAgentWithTechnicianReport(ticketId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/api/app/report/generate-support-agent-with-technician-report/${ticketId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/pdf',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.status}`)
    }

    return response.blob()
  }

  // Admin specific
  async getAllUsers(params?: {
    skipCount?: number
    maxResultCount?: number
    sorting?: string
    filter?: string
  }): Promise<ApiResponse<AbpPagedResult<User>>> {
    const queryParams = new URLSearchParams()
    if (params?.skipCount) queryParams.append('SkipCount', params.skipCount.toString())
    if (params?.maxResultCount) queryParams.append('MaxResultCount', params.maxResultCount.toString())
    if (params?.sorting) queryParams.append('Sorting', params.sorting)
    if (params?.filter) queryParams.append('Filter', params.filter)
    
    const query = queryParams.toString()
    const endpoint = query ? `/api/identity/users?${query}` : '/api/identity/users'
    return this.request<AbpPagedResult<User>>(endpoint)
  }

  async getReports(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/app/admin/reports')
  }

  // ABP.IO specific utilities
  async getApplicationInfo(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/abp/application-info')
  }

  async getCurrentTenant(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/multi-tenancy/current-tenant')
  }

  // Support Ticket APIs
  async createSupportTicket(ticketData: {
    servicePlanId: string;
    subject: string;
    description: string;
  }): Promise<ApiResponse<any>> {
    const payload = {
      id: crypto.randomUUID(), // Generate a new UUID for the ticket
      servicePlanId: ticketData.servicePlanId,
      subject: ticketData.subject,
      description: ticketData.description
    }

    try {
      const response = await fetch(`${this.baseURL}/api/app/support-ticket/support-ticket`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      })

      console.log('Create support ticket response status:', response.status)

      if (!response.ok) {
        let errorMessage = 'Failed to create support ticket'
        
        try {
          const errorData = await response.json()
          console.log('Create ticket error data:', errorData)
          
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          } else if (errorData.error?.details) {
            errorMessage = errorData.error.details
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.details) {
            errorMessage = errorData.details
          }
        } catch (jsonError) {
          console.log('Could not parse error response as JSON')
          const errorText = await response.text()
          console.log('Raw error response:', errorText)
          errorMessage = `Failed to create support ticket with status ${response.status}: ${errorText}`
        }
        
        return {
          data: null,
          success: false,
          message: errorMessage
        }
      }

      // Handle response parsing more carefully
      let data = null
      try {
        const responseText = await response.text()
        console.log('Create support ticket raw response:', responseText)
        
        if (responseText && responseText.trim() !== '') {
          data = JSON.parse(responseText)
          console.log('Create support ticket parsed data:', data)
        } else {
          console.log('Create support ticket: Empty response body')
          data = null
        }
      } catch (parseError) {
        console.log('Create support ticket: Could not parse response as JSON, treating as success')
        data = null
      }
      
      return { 
        data: data,
        success: true,
        message: 'Support ticket created successfully'
      }
    } catch (error) {
      console.error('Create support ticket error:', error)
      return {
        data: null,
        success: false,
        message: 'Failed to create support ticket'
      }
    }
  }

  // Service Plan Management Methods
  async suspendUserServicePlan(id: string, suspensionReason: string): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 [Suspend Plan] Sending suspend request:', { id, suspensionReason })
      
      const result = await this.request<any>('/api/app/user-service-plan/suspend-user-service-plan', {
        method: 'POST',
        body: JSON.stringify({
          id,
          suspensionReason
        })
      })

      console.log('Suspend plan result:', result)
      
      if (result.success) {
        return { 
          data: result.data,
          success: true,
          message: 'Service plan suspended successfully'
        }
      } else {
        return {
          data: null,
          success: false,
          message: result.message || 'Failed to suspend service plan'
        }
      }
    } catch (error) {
      console.error('Suspend plan error:', error)
      return {
        data: null,
        success: false,
        message: 'Failed to suspend service plan'
      }
    }
  }

  async reactivateUserServicePlan(id: string): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 [Reactivate Plan] Sending reactivate request:', { id })
      
      const result = await this.request<any>(`/api/app/user-service-plan/${id}/reactivate-user-service-plan`, {
        method: 'POST'
      })

      console.log('Reactivate plan result:', result)
      
      if (result.success) {
        return { 
          data: result.data,
          success: true,
          message: 'Service plan reactivated successfully'
        }
      } else {
        return {
          data: null,
          success: false,
          message: result.message || 'Failed to reactivate service plan'
        }
      }
    } catch (error) {
      console.error('Reactivate plan error:', error)
      return {
        data: null,
        success: false,
        message: 'Failed to reactivate service plan'
      }
    }
  }

  async cancelUserServicePlan(id: string): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 [Cancel Plan] Sending cancel request:', { id })
      
      const result = await this.request<any>(`/api/app/user-service-plan/${id}/cancel-user-service-plan`, {
        method: 'POST'
      })

      console.log('Cancel plan result:', result)
      
      if (result.success) {
        return { 
          data: result.data,
          success: true,
          message: 'Service plan cancelled successfully'
        }
      } else {
        return {
          data: null,
          success: false,
          message: result.message || 'Failed to cancel service plan'
        }
      }
    } catch (error) {
      console.error('Cancel plan error:', error)
      return {
        data: null,
        success: false,
        message: 'Failed to cancel service plan'
      }
    }
  }

  async updateTicketPriority(ticketId: string, priority: number): Promise<ApiResponse<any>> {
    try {
      console.log('🔍 [Update Priority] Sending priority update request:', { ticketId, priority })
      
      const result = await this.request<any>(`/api/app/support-ticket/ticket-priority/${ticketId}?priority=${priority}`, {
        method: 'PUT'
      })

      console.log('Update priority result:', result)
      
      if (result.success) {
        return { 
          data: result.data,
          success: true,
          message: 'Ticket priority updated successfully'
        }
      } else {
        return {
          data: null,
          success: false,
          message: result.message || 'Failed to update ticket priority'
        }
      }
    } catch (error) {
      console.error('Update priority error:', error)
      return {
        data: null,
        success: false,
        message: 'Failed to update ticket priority'
      }
    }
  }

  async getTechnicians(): Promise<ApiResponse<{
    totalCount: number
    items: Array<{
      id: string
      name: string
      email: string
      phoneNumber: string
      userType: number
      isActive: boolean
      supportTickets: any[]
      userServicePlans: any[]
      isDeleted: boolean
      deleterId: string | null
      deletionTime: string | null
      lastModificationTime: string | null
      lastModifierId: string | null
      creationTime: string
      creatorId: string | null
    }>
  }>> {
    try {
      console.log('🔍 [Get Technicians] Fetching technicians...')
      
      const result = await this.request<{
        totalCount: number
        items: Array<{
          id: string
          name: string
          email: string
          phoneNumber: string
          userType: number
          isActive: boolean
          supportTickets: any[]
          userServicePlans: any[]
          isDeleted: boolean
          deleterId: string | null
          deletionTime: string | null
          lastModificationTime: string | null
          lastModifierId: string | null
          creationTime: string
          creatorId: string | null
        }>
      }>('/api/app/app-user/technicians', {
        method: 'GET'
      })

      console.log('Get technicians result:', result)
      
      if (result.success) {
        return { 
          data: result.data,
          success: true,
          message: 'Technicians fetched successfully'
        }
      } else {
        return {
          data: { totalCount: 0, items: [] },
          success: false,
          message: result.message || 'Failed to fetch technicians'
        }
      }
    } catch (error) {
      console.error('Get technicians error:', error)
      return {
        data: { totalCount: 0, items: [] },
        success: false,
        message: 'Failed to fetch technicians'
      }
    }
  }

  // Get all users
  async getUsers(): Promise<ApiResponse<{
    totalCount: number;
    items: Array<{
      id: string;
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
    }>;
  }>> {
    try {
      console.log('🔍 [Users] Fetching from: /api/app/app-user/users')
      console.log('🔍 [Users] Full URL:', `${this.baseURL}/api/app/app-user/users`)
      
      const response = await fetch(`${this.baseURL}/api/app/app-user/users`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      console.log('🔍 [Users] Response status:', response.status)
      console.log('🔍 [Users] Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let errorMessage = 'Failed to fetch users'
        
        try {
          const errorData = await response.json()
          console.log('Get users error data:', errorData)
          
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          } else if (errorData.error?.details) {
            errorMessage = errorData.error.details
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (parseError) {
          console.log('Could not parse error response:', parseError)
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('🔍 [Users] Success response:', data)
      
      return {
        success: true,
        data: data,
        message: 'Users fetched successfully'
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      return {
        success: false,
        data: { totalCount: 0, items: [] },
        message: error instanceof Error ? error.message : 'Failed to fetch users'
      }
    }
  }

  // Generate Monthly Summary Report
  async generateSummaryReport(startDate: string, endDate: string): Promise<ApiResponse<Blob>> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('startDate', startDate)
      queryParams.append('endDate', endDate)
      const query = queryParams.toString()
      const endpoint = `/api/app/report/generate-summary-report?${query}`
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/pdf' },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const pdfBlob = await response.blob()
      
      // Trigger download
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `SummaryReport_${startDate}_to_${endDate}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return {
        success: true,
        data: pdfBlob,
        message: 'Summary report generated and downloaded successfully'
      }
    } catch (error) {
      console.error('Error generating summary report:', error)
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : 'Failed to generate summary report'
      }
    }
  }


}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
