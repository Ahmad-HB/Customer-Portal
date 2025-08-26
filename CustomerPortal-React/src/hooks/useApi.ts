import { useState, useCallback } from 'react'
import { apiClient, type ApiResponse } from '@/lib/api-client'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<ApiResponse<T>>
  reset: () => void
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      try {
        const response = await apiFunction(...args)
        
        if (response.success) {
          setState({
            data: response.data,
            loading: false,
            error: null,
          })
        } else {
          setState({
            data: null,
            loading: false,
            error: response.message || 'API request failed',
          })
        }
        
        return response
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        })
        
        return {
          data: null as T,
          success: false,
          message: errorMessage,
        }
      }
    },
    [apiFunction]
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

// Specific hooks for common API operations
export function useLogin() {
  return useApi(apiClient.login)
}

export function useGetCurrentUser() {
  return useApi(apiClient.getCurrentUser)
}

export function useUpdateUser() {
  return useApi(apiClient.updateUser)
}

export function useGetTickets() {
  return useApi(apiClient.getTickets)
}

export function useCreateTicket() {
  return useApi(apiClient.createTicket)
}

export function useGetServicePlans() {
  return useApi(apiClient.getServicePlans)
}

export function useGetAssignedTickets() {
  return useApi(apiClient.getAssignedTickets)
}
