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
