import { useState, useCallback, useEffect } from 'react'
import { apiClient, type AbpPagedResult } from '@/lib/api-client'

// ABP pagination parameters
export interface AbpPaginationParams {
  skipCount?: number
  maxResultCount?: number
  sorting?: string
  filter?: string
}

// Hook for ABP paged results
export function useAbpPagedApi<T>(
  apiFunction: (params?: AbpPaginationParams) => Promise<any>,
  initialParams?: AbpPaginationParams
) {
  const [data, setData] = useState<AbpPagedResult<T> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<AbpPaginationParams>({
    skipCount: 0,
    maxResultCount: 10,
    ...initialParams,
  })

  const execute = useCallback(
    async (newParams?: AbpPaginationParams) => {
      setLoading(true)
      setError(null)
      
      try {
        const currentParams = newParams || params
        const response = await apiFunction(currentParams)
        
        if (response.success) {
          setData(response.data)
          setParams(currentParams)
        } else {
          setError(response.message || 'API request failed')
        }
        
        return response
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setError(errorMessage)
        return {
          data: null,
          success: false,
          message: errorMessage,
        }
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, params]
  )

  const loadMore = useCallback(() => {
    if (data && data.items.length < data.totalCount) {
      const newParams = {
        ...params,
        skipCount: (params.skipCount || 0) + (params.maxResultCount || 10),
      }
      execute(newParams)
    }
  }, [data, params, execute])

  const refresh = useCallback(() => {
    execute()
  }, [execute])

  const setPage = useCallback((page: number) => {
    const newParams = {
      ...params,
      skipCount: page * (params.maxResultCount || 10),
    }
    execute(newParams)
  }, [params, execute])

  const setPageSize = useCallback((pageSize: number) => {
    const newParams = {
      ...params,
      maxResultCount: pageSize,
      skipCount: 0, // Reset to first page
    }
    execute(newParams)
  }, [params, execute])

  const setSorting = useCallback((sorting: string) => {
    const newParams = {
      ...params,
      sorting,
      skipCount: 0, // Reset to first page
    }
    execute(newParams)
  }, [params, execute])

  const setFilter = useCallback((filter: string) => {
    const newParams = {
      ...params,
      filter,
      skipCount: 0, // Reset to first page
    }
    execute(newParams)
  }, [params, execute])

  // Auto-execute on mount
  useEffect(() => {
    execute()
  }, [execute])

  return {
    data,
    loading,
    error,
    params,
    execute,
    loadMore,
    refresh,
    setPage,
    setPageSize,
    setSorting,
    setFilter,
    // Pagination helpers
    currentPage: data ? Math.floor((params.skipCount || 0) / (params.maxResultCount || 10)) : 0,
    totalPages: data ? Math.ceil(data.totalCount / (params.maxResultCount || 10)) : 0,
    hasMore: data ? data.items.length < data.totalCount : false,
  }
}

// Specific ABP hooks
export function useAbpTickets(params?: AbpPaginationParams) {
  return useAbpPagedApi(apiClient.getTickets, params)
}

export function useAbpServicePlans(params?: AbpPaginationParams) {
  return useAbpPagedApi(apiClient.getServicePlans, params)
}

export function useAbpAssignedTickets(params?: AbpPaginationParams) {
  return useAbpPagedApi(apiClient.getAssignedTickets, params)
}

export function useAbpSupportTickets(params?: AbpPaginationParams) {
  return useAbpPagedApi(apiClient.getSupportTickets, params)
}

export function useAbpUsers(params?: AbpPaginationParams) {
  return useAbpPagedApi(apiClient.getAllUsers, params)
}

// ABP CRUD operations hook
export function useAbpCrud(
  getFunction: (id: string) => Promise<any>,
  createFunction: (data: any) => Promise<any>,
  updateFunction: (id: string, data: any) => Promise<any>,
  deleteFunction: (id: string) => Promise<any>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const get = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await getFunction(id)
      if (!response.success) {
        setError(response.message || 'Failed to fetch')
      }
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [getFunction])

  const create = useCallback(async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await createFunction(data)
      if (!response.success) {
        setError(response.message || 'Failed to create')
      }
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [createFunction])

  const update = useCallback(async (id: string, data: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await updateFunction(id, data)
      if (!response.success) {
        setError(response.message || 'Failed to update')
      }
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [updateFunction])

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await deleteFunction(id)
      if (!response.success) {
        setError(response.message || 'Failed to delete')
      }
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [deleteFunction])

  return {
    loading,
    error,
    get,
    create,
    update,
    remove,
  }
}

// ABP Ticket CRUD
export function useAbpTicketCrud() {
  return useAbpCrud(
    apiClient.getTicket,
    apiClient.createTicket,
    apiClient.updateTicket,
    apiClient.deleteTicket
  )
}

// Current App User hook for role-based access control
export function useCurrentAppUser() {
  const [appUser, setAppUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppUser = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await apiClient.getCurrentAppUser()
        
        if (response.success && response.data) {
          setAppUser(response.data)
        } else {
          setError(response.message || 'Failed to get app user')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppUser()
  }, [])

  const isAdmin = appUser?.userType === 1 // UserType.Admin
  const isCustomer = appUser?.userType === 2 // UserType.Customer
  const isSupportAgent = appUser?.userType === 3 // UserType.SupportAgent
  const isTechnician = appUser?.userType === 4 // UserType.Technician

  return {
    appUser,
    isLoading,
    error,
    isAdmin,
    isCustomer,
    isSupportAgent,
    isTechnician,
    refetch: () => {
      setIsLoading(true)
      setError(null)
      apiClient.getCurrentAppUser().then(response => {
        if (response.success && response.data) {
          setAppUser(response.data)
        } else {
          setError(response.message || 'Failed to get app user')
        }
        setIsLoading(false)
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setIsLoading(false)
      })
    }
  }
}

// Current User Role hook that always returns a true role
export function useCurrentUserRole() {
  const [roleData, setRoleData] = useState<{ role: string; userType: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🔍 [useCurrentUserRole] Fetching user role...')
        const response = await apiClient.getCurrentUserRole()
        
        console.log('🔍 [useCurrentUserRole] API Response:', response)
        
        if (response.success && response.data) {
          setRoleData(response.data)
          console.log('🔍 [useCurrentUserRole] Role data set:', response.data)
        } else {
          setError(response.message || 'Failed to get user role')
          console.error('🔍 [useCurrentUserRole] API failed:', response.message)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        console.error('🔍 [useCurrentUserRole] API error:', errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserRole()
  }, [])

  // Handle the string response from the new API endpoint
  // The API returns "admin", "customer", "technician", "supportAgent"
  const currentRole = roleData?.role || null
  const currentUserType = roleData?.userType || null

  // Convert string role to numeric userType for compatibility
  const roleToUserType: Record<string, number> = {
    'admin': 1,
    'customer': 2,
    'supportAgent': 3,
    'technician': 4,
    // Also handle the exact case from the API
    'SupportAgent': 3,
    'Admin': 1,
    'Customer': 2,
    'Technician': 4
  }

  // PRIORITY: Use the string role from API as the source of truth
  // If the API returns a string role, use that instead of userType
  // This fixes the issue where userType might be incorrect
  const effectiveUserType = currentRole ? roleToUserType[currentRole] || roleToUserType[currentRole.toLowerCase()] : currentUserType

  // Only set boolean flags if we have a valid role
  const isAdmin = effectiveUserType === 1
  const isCustomer = effectiveUserType === 2
  const isSupportAgent = effectiveUserType === 3
  const isTechnician = effectiveUserType === 4

  // DEBUG: Log what the hook is returning
  console.log('🔍 [useCurrentUserRole] Hook Debug:', {
    roleData,
    currentRole,
    currentUserType,
    effectiveUserType,
    isAdmin,
    isCustomer,
    isSupportAgent,
    isTechnician,
    apiResponse: roleData,
    timestamp: new Date().toISOString()
  })

  return {
    role: currentRole,
    userType: effectiveUserType,
    isLoading,
    error,
    isAdmin,
    isCustomer,
    isSupportAgent,
    isTechnician,
    refetch: () => {
      setIsLoading(true)
      setError(null)
      apiClient.getCurrentUserRole().then(response => {
        if (response.success && response.data) {
          setRoleData(response.data)
        } else {
          setError(response.message || 'Failed to get user role')
        }
        setIsLoading(false)
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setIsLoading(false)
      })
    }
  }
}
