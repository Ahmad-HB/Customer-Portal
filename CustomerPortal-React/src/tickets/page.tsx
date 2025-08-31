"use client"

import { useState } from "react"
import { Plus, Info, Calendar, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NewTicketModal } from "@/components/new-ticket-modal"
import { useTickets } from "@/hooks/useTickets"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function TicketsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { 
    tickets, 
    loading, 
    error, 
    totalCount,
    currentPage,
    totalPages,
    fetchTickets,
    refreshTickets 
  } = useTickets()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
          {totalCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {totalCount} ticket{totalCount !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTickets}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            className="rounded-full bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200"
            onClick={() => setIsModalOpen(true)}
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-2 text-muted-foreground">Loading tickets...</span>
        </div>
      )}

      {/* Tickets List */}
      {!loading && tickets.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tickets found. Create your first ticket to get started.</p>
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="border border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground">{ticket.name}</h2>
                      <div className="mt-2 flex gap-2">
                        <Badge 
                          variant="secondary" 
                          className={
                            ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                            ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={
                            ticket.priority === 'high' ? 'border-red-200 text-red-600' :
                            ticket.priority === 'medium' ? 'border-orange-200 text-orange-600' :
                            'border-blue-200 text-blue-600'
                          }
                        >
                          {ticket.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground">{ticket.description}</p>

                  {/* Footer Info */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <span>{ticket.servicePlan}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(ticket.creationTime || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTickets(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTickets(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}

      <NewTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
