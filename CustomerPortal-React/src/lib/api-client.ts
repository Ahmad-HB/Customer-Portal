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
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      console.log('Getting current user from: /api/account/my-profile')
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
        const user: User = {
          id: data.id || 'user-id',
          username: data.userName,
          name: data.name,
          email: data.email,
          phone: data.phoneNumber,
          role: 'customer', // Default role, you might want to get this from user claims or roles
          emailConfirmed: true, // Assuming confirmed if we can get the profile
          phoneNumberConfirmed: true,
          creationTime: new Date().toISOString(),
          creatorId: data.id || 'user-id',
          lastModificationTime: new Date().toISOString(),
          lastModifierId: data.id || 'user-id',
          isDeleted: false
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

  async updateUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    // Map frontend User fields to backend API structure
    const updatePayload = {
      userName: userData.username,
      email: userData.email,
      name: userData.name,
      surname: '', // Backend expects this but frontend User doesn't have it
      phoneNumber: userData.phone
    }

    try {
      const response = await fetch(`${this.baseURL}/api/account/my-profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(updatePayload),
        credentials: 'include'
      })

      console.log('Update user response status:', response.status)

      if (!response.ok) {
        let errorMessage = 'Profile update failed'
        
        try {
          const errorData = await response.json()
          console.log('Update user error data:', errorData)
          
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          } else if (errorData.error?.details) {
            errorMessage = errorData.error.details
          }
        } catch (jsonError) {
          console.log('Could not parse error response as JSON')
          errorMessage = `Profile update failed with status ${response.status}`
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
        console.log('Raw update user response text:', responseText)
        
        if (!responseText.trim()) {
          console.log('Empty response, treating as successful update')
          // Return success with the data that was sent
          return { 
            data: userData as User,
            success: true,
            message: 'Profile updated successfully'
          }
        }
        
        data = JSON.parse(responseText)
        console.log('Update user success data:', data)
      } catch (jsonError) {
        console.log('Could not parse success response as JSON:', jsonError)
        // Return success with the data that was sent
        return { 
          data: userData as User,
          success: true,
          message: 'Profile updated successfully'
        }
      }
      
      // Map backend response to frontend User interface
      if (data) {
        const updatedUser: User = {
          id: data.id || '',
          username: data.userName || userData.username || '',
          name: data.name || userData.name || '',
          email: data.email || userData.email || '',
          phone: data.phoneNumber || userData.phone || '',
          role: 'customer', // Default role
          emailConfirmed: true, // Assume confirmed after update
          phoneNumberConfirmed: true, // Assume confirmed after update
          creationTime: new Date().toISOString(),
          creatorId: '',
          lastModificationTime: new Date().toISOString(),
          lastModifierId: '',
          isDeleted: false
        }
        
        return {
          data: updatedUser,
          success: true,
          message: 'Profile updated successfully'
        }
      }
      
      return {
        data: null as unknown as User,
        success: false,
        message: 'Profile update failed - no data received'
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
    // ABP.io RegisterDto structure with extended properties
    const registerPayload = {
      userName: userData.username,
      emailAddress: userData.email,
      password: userData.password,
      appName: 'CustomerPortal',
      // Extended properties for Name and PhoneNumber
      extraProperties: {
        Name: userData.name,
        PhoneNumber: userData.phone
      }
    }

    try {
      const response = await fetch(`${this.baseURL}/api/account/register`, {
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
          
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          } else if (errorData.error?.details) {
            errorMessage = errorData.error.details
          }
        } catch (jsonError) {
          console.log('Could not parse error response as JSON')
          errorMessage = `Registration failed with status ${response.status}`
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
      if (data.result && data.result.id) {
        // Registration successful, return user data
        const user: User = {
          id: data.result.id,
          username: data.result.userName,
          name: userData.name,
          email: data.result.email,
          phone: userData.phone,
          role: 'customer',
          emailConfirmed: false,
          phoneNumberConfirmed: false,
          creationTime: new Date().toISOString()
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

  // Suspend User Service Plan
  async suspendUserServicePlan(id: string): Promise<ApiResponse<void>> {
    console.log(`Suspending user service plan with ID: ${id}`)
    console.log(`Calling endpoint: /api/app/user-service-plan/${id}/suspend-user-service-plan`)
    
    const result = await this.request<void>(`/api/app/user-service-plan/${id}/suspend-user-service-plan`, {
      method: 'POST',
    })
    
    console.log('Suspend result:', result)
    return result
  }

  // Reactivate User Service Plan
  async reactivateUserServicePlan(id: string): Promise<ApiResponse<void>> {
    console.log(`Reactivating user service plan with ID: ${id}`)
    console.log(`Calling endpoint: /api/app/user-service-plan/${id}/reactivate-user-service-plan`)
    
    const result = await this.request<void>(`/api/app/user-service-plan/${id}/reactivate-user-service-plan`, {
      method: 'POST',
    })
    
    console.log('Reactivate result:', result)
    return result
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

  // Support Agent specific
  async getSupportTickets(params?: {
    skipCount?: number
    maxResultCount?: number
    sorting?: string
    filter?: string
  }): Promise<ApiResponse<AbpPagedResult<Ticket>>> {
    const queryParams = new URLSearchParams()
    if (params?.skipCount) queryParams.append('SkipCount', params.skipCount.toString())
    if (params?.maxResultCount) queryParams.append('MaxResultCount', params.maxResultCount.toString())
    if (params?.sorting) queryParams.append('Sorting', params.sorting)
    if (params?.filter) queryParams.append('Filter', params.filter)
    
    const query = queryParams.toString()
    const endpoint = query ? `/api/app/support/tickets?${query}` : '/api/app/support/tickets'
    return this.request<AbpPagedResult<Ticket>>(endpoint)
  }

  async assignTicket(ticketId: string, technicianId: string): Promise<ApiResponse<Ticket>> {
    return this.request<Ticket>(`/api/app/support/ticket/${ticketId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ technicianId }),
    })
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
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
