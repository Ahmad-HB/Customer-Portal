import { useState, useEffect } from 'react'
import { apiClient, type UserServicePlan } from '@/lib/api-client'

interface UseUserServicePlansReturn {
  userServicePlans: UserServicePlan[]
  loading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
  fetchUserServicePlans: () => Promise<void>
  refreshUserServicePlans: () => Promise<void>
  suspendUserServicePlan: (id: string) => Promise<boolean>
  reactivateUserServicePlan: (id: string) => Promise<boolean>
}

export function useUserServicePlans(): UseUserServicePlansReturn {
  const [userServicePlans, setUserServicePlans] = useState<UserServicePlan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  const fetchUserServicePlans = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getUserServicePlans({
        skipCount: (currentPage - 1) * pageSize,
        maxResultCount: pageSize
      })

      if (response.success && response.data) {
        setUserServicePlans(response.data.items || [])
        setTotalCount(response.data.totalCount || 0)
        setTotalPages(response.data.totalPages || 1)
      } else {
        setError(response.message || 'Failed to fetch user service plans')
        setUserServicePlans([])
      }
    } catch (err) {
      console.error('Error fetching user service plans:', err)
      setError('Failed to fetch user service plans')
      setUserServicePlans([])
    } finally {
      setLoading(false)
    }
  }

  const refreshUserServicePlans = async () => {
    await fetchUserServicePlans()
  }

  const suspendUserServicePlan = async (id: string, suspensionReason: string = "Suspended by admin"): Promise<boolean> => {
    try {
      const response = await apiClient.suspendUserServicePlan(id, suspensionReason)
      if (response.success) {
        // Refresh the list to show updated status
        await refreshUserServicePlans()
        return true
      } else {
        setError(response.message || 'Failed to suspend service plan')
        return false
      }
    } catch (err) {
      console.error('Error suspending user service plan:', err)
      setError('Failed to suspend service plan')
      return false
    }
  }

  const reactivateUserServicePlan = async (id: string): Promise<boolean> => {
    try {
      const response = await apiClient.reactivateUserServicePlan(id)
      if (response.success) {
        // Refresh the list to show updated status
        await refreshUserServicePlans()
        return true
      } else {
        setError(response.message || 'Failed to reactivate service plan')
        return false
      }
    } catch (err) {
      console.error('Error reactivating user service plan:', err)
      setError('Failed to reactivate service plan')
      return false
    }
  }

  useEffect(() => {
    fetchUserServicePlans()
  }, [currentPage, pageSize])

  return {
    userServicePlans,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    totalPages,
    fetchUserServicePlans,
    refreshUserServicePlans,
    suspendUserServicePlan,
    reactivateUserServicePlan
  }
}
