import { useState, useEffect } from 'react'
import { apiClient, type ServicePlan } from '@/lib/api-client'

interface UseServicePlansReturn {
  servicePlans: ServicePlan[]
  loading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
  fetchServicePlans: (page?: number, pageSize?: number) => Promise<void>
  getServicePlan: (id: string) => Promise<ServicePlan | null>
  subscribeToPlan: (servicePlanId: string) => Promise<boolean>
  refreshServicePlans: () => Promise<void>
}

export function useServicePlans(): UseServicePlansReturn {
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  const fetchServicePlans = async (page: number = 1, size: number = 10) => {
    setLoading(true)
    setError(null)
    
    try {
      const skipCount = (page - 1) * size
      const response = await apiClient.getServicePlans({
        skipCount,
        maxResultCount: size,
        sorting: 'name asc'
      })

      if (response.success && response.data) {
        setServicePlans(response.data.items)
        setTotalCount(response.data.totalCount)
        setCurrentPage(page)
        setPageSize(size)
        setTotalPages(response.data.totalPages)
      } else {
        setError(response.message || 'Failed to fetch service plans')
      }
    } catch (err) {
      setError('Failed to fetch service plans')
      console.error('Error fetching service plans:', err)
    } finally {
      setLoading(false)
    }
  }

  const getServicePlan = async (id: string): Promise<ServicePlan | null> => {
    try {
      const response = await apiClient.getServicePlan(id)
      
      if (response.success && response.data) {
        return response.data
      } else {
        setError(response.message || 'Failed to fetch service plan')
        return null
      }
    } catch (err) {
      setError('Failed to fetch service plan')
      console.error('Error fetching service plan:', err)
      return null
    }
  }

  const subscribeToPlan = async (servicePlanId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.subscribeToServicePlan(servicePlanId)
      
      if (response.success) {
        return true
      } else {
        // Handle specific error cases
        if (response.message?.includes('403') || response.message?.includes('Forbidden')) {
          setError('You do not have permission to subscribe to this plan. Please contact support.')
        } else if (response.message?.includes('401') || response.message?.includes('Unauthorized')) {
          setError('Please log in to subscribe to service plans.')
        } else {
          setError(response.message || 'Failed to subscribe to plan')
        }
        return false
      }
    } catch (err) {
      console.error('Error subscribing to plan:', err)
      setError('Failed to subscribe to plan. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const refreshServicePlans = async () => {
    await fetchServicePlans(currentPage, pageSize)
  }

  // Load service plans on mount
  useEffect(() => {
    fetchServicePlans()
  }, [])

  return {
    servicePlans,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    totalPages,
    fetchServicePlans,
    getServicePlan,
    subscribeToPlan,
    refreshServicePlans
  }
}
