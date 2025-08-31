import { useState, useEffect } from 'react'
import { apiClient, type Ticket } from '@/lib/api-client'

interface UseTicketsReturn {
  tickets: Ticket[]
  loading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
  fetchTickets: (page?: number, pageSize?: number) => Promise<void>
  createTicket: (ticketData: Omit<Ticket, 'id' | 'creationTime' | 'creatorId'>) => Promise<boolean>
  updateTicket: (id: string, ticketData: Partial<Ticket>) => Promise<boolean>
  deleteTicket: (id: string) => Promise<boolean>
  refreshTickets: () => Promise<void>
}

export function useTickets(): UseTicketsReturn {
  const [tickets, setTickets] = useState<Ticket[]>([])
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
      const skipCount = (page - 1) * size
      const response = await apiClient.getTickets({
        skipCount,
        maxResultCount: size,
        sorting: 'creationTime desc'
      })

      if (response.success && response.data) {
        setTickets(response.data.items)
        setTotalCount(response.data.totalCount)
        setCurrentPage(page)
        setPageSize(size)
        setTotalPages(response.data.totalPages)
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

  const createTicket = async (ticketData: Omit<Ticket, 'id' | 'creationTime' | 'creatorId'>): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.createTicket(ticketData)
      
      if (response.success && response.data) {
        // Refresh the tickets list
        await fetchTickets(currentPage, pageSize)
        return true
      } else {
        setError(response.message || 'Failed to create ticket')
        return false
      }
    } catch (err) {
      setError('Failed to create ticket')
      console.error('Error creating ticket:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateTicket = async (id: string, ticketData: Partial<Ticket>): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.updateTicket(id, ticketData)
      
      if (response.success && response.data) {
        // Update the ticket in the local state
        setTickets(prev => prev.map(ticket => 
          ticket.id === id ? { ...ticket, ...response.data } : ticket
        ))
        return true
      } else {
        setError(response.message || 'Failed to update ticket')
        return false
      }
    } catch (err) {
      setError('Failed to update ticket')
      console.error('Error updating ticket:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteTicket = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.deleteTicket(id)
      
      if (response.success) {
        // Remove the ticket from the local state
        setTickets(prev => prev.filter(ticket => ticket.id !== id))
        setTotalCount(prev => prev - 1)
        return true
      } else {
        setError(response.message || 'Failed to delete ticket')
        return false
      }
    } catch (err) {
      setError('Failed to delete ticket')
      console.error('Error deleting ticket:', err)
      return false
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
    createTicket,
    updateTicket,
    deleteTicket,
    refreshTickets
  }
}
