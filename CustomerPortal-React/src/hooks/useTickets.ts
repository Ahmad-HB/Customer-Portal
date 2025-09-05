import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

// Support Ticket interface based on the API response
interface SupportTicket {
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
  appUserEmail?: string;
  supportagentId?: string;
  supportagentName?: string;
  supportagentEmail?: string;
  technicianId?: string;
  technicianName?: string;
  technicianEmail?: string;
  identityUserName: string;
  servicePlanId: string;
  servicePlanName: string;
  subject: string;
  description: string;
  priority: number;
  status: number;
  createdAt: string;
  resolvedAt?: string;
}

interface UseTicketsReturn {
  tickets: SupportTicket[]
  loading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
  fetchTickets: (page?: number, pageSize?: number) => Promise<void>
  refreshTickets: () => Promise<void>
}

export function useTickets(): UseTicketsReturn {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  const fetchTickets = async (page: number = 1, size: number = 10) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getSupportTickets()

      if (response.success && response.data) {
        // Filter out deleted tickets
        const activeTickets: SupportTicket[] = response.data.items.filter(ticket => !ticket.isDeleted)
        
        // Calculate pagination
        const startIndex = (page - 1) * size
        const endIndex = startIndex + size
        const paginatedTickets = activeTickets.slice(startIndex, endIndex)
        
        setTickets(paginatedTickets)
        setTotalCount(activeTickets.length)
        setCurrentPage(page)
        setPageSize(size)
        setTotalPages(Math.ceil(activeTickets.length / size))
      } else {
        setError(response.message || 'Failed to fetch tickets')
      }
    } catch (err) {
      setError('Failed to fetch tickets')
      console.error('Error fetching tickets:', err)
    } finally {
      setLoading(false)
    }
  }


  const refreshTickets = async () => {
    await fetchTickets(currentPage, pageSize)
  }

  // Load tickets on mount
  useEffect(() => {
    fetchTickets()
  }, [])

  return {
    tickets,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    totalPages,
    fetchTickets,
    refreshTickets
  }
}
