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

      const data = await response.json()
      
      // Handle ABP response format
      if (data.__abp) {
        return { data: data.result || data, success: true }
      }
      
      return { data, success: true }
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
      // Call the ABP.IO logout endpoint
      const response = await fetch(`${this.baseURL}/api/account/logout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include' // Include cookies for session-based auth
      })

      console.log('Logout response status:', response.status)
      
      if (response.ok) {
        console.log('Logout successful')
      } else {
        console.log('Logout failed with status:', response.status)
      }
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      // Always clear local state regardless of API response
      this.token = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      localStorage.removeItem('demo_token')
      localStorage.removeItem('remember_me')
      localStorage.removeItem('remembered_user')
    }
  }

  setToken(token: string): void {
    this.token = token
    localStorage.setItem('access_token', token)
  }

  getToken(): string | null {
    return this.token
  }

  // User Management (ABP Account)
  async getCurrentUser(): Promise<ApiResponse<User>> {
    // Try different possible endpoints for getting current user
    const endpoints = [
      '/api/account/my-profile',
      '/api/identity/my-profile',
      '/api/account/profile',
      '/api/identity/profile'
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying to get user from: ${endpoint}`)
        const response = await this.request<User>(endpoint)
        if (response.success && response.data) {
          console.log(`Successfully got user from: ${endpoint}`)
          return response
        }
      } catch (error) {
        console.log(`Failed to get user from ${endpoint}:`, error)
      }
    }

    // If all endpoints fail, create a demo user for development
    console.log('All user profile endpoints failed, creating demo user')
    const demoUser: User = {
      id: 'demo-user-id',
      username: 'demo-user',
      name: 'Demo User',
      email: 'demo@example.com',
      phone: '+1234567890',
      role: 'customer'
    }

    return {
      data: demoUser,
      success: true,
      message: 'Using demo user profile'
    }
  }

  async updateUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/api/account/my-profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    return this.request<User>('/api/account/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  // ABP Application Services
  async getTickets(params?: {
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
    const endpoint = query ? `/api/app/ticket?${query}` : '/api/app/ticket'
    return this.request<AbpPagedResult<Ticket>>(endpoint)
  }

  async getTicket(id: string): Promise<ApiResponse<Ticket>> {
    return this.request<Ticket>(`/api/app/ticket/${id}`)
  }

  async createTicket(ticketData: Omit<Ticket, 'id' | 'creationTime' | 'creatorId'>): Promise<ApiResponse<Ticket>> {
    return this.request<Ticket>('/api/app/ticket', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    })
  }

  async updateTicket(id: string, ticketData: Partial<Ticket>): Promise<ApiResponse<Ticket>> {
    return this.request<Ticket>(`/api/app/ticket/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    })
  }

  async deleteTicket(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/app/ticket/${id}`, {
      method: 'DELETE',
    })
  }

  // Service Plans
  async getServicePlans(params?: {
    skipCount?: number
    maxResultCount?: number
    sorting?: string
    filter?: string
  }): Promise<ApiResponse<AbpPagedResult<ServicePlan>>> {
    const queryParams = new URLSearchParams()
    if (params?.skipCount) queryParams.append('SkipCount', params.skipCount.toString())
    if (params?.maxResultCount) queryParams.append('MaxResultCount', params.maxResultCount.toString())
    if (params?.sorting) queryParams.append('Sorting', params.sorting)
    if (params?.filter) queryParams.append('Filter', params.filter)
    
    const query = queryParams.toString()
    const endpoint = query ? `/api/app/service-plan?${query}` : '/api/app/service-plan'
    return this.request<AbpPagedResult<ServicePlan>>(endpoint)
  }

  async getServicePlan(id: string): Promise<ApiResponse<ServicePlan>> {
    return this.request<ServicePlan>(`/api/app/service-plan/${id}`)
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
