"use client"

import { useState } from "react"
import { Plus, RefreshCw, User, UserCheck, Clock, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NewTicketModal } from "@/components/new-ticket-modal"
import { useTickets } from "@/hooks/useTickets"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Helper functions to map API values to display values
const getStatusDisplay = (status: number) => {
  switch (status) {
    case 1: return { text: 'Open', color: 'bg-yellow-100 text-yellow-800' }
    case 2: return { text: 'In Progress', color: 'bg-blue-100 text-blue-800' }
    case 3: return { text: 'Resolved', color: 'bg-green-100 text-green-800' }
    case 4: return { text: 'Closed', color: 'bg-gray-100 text-gray-800' }
    default: return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' }
  }
}

const getPriorityDisplay = (priority: number, isAssigned: boolean) => {
  if (!isAssigned) {
    return { text: 'Not Priority Yet', color: 'border-gray-200 text-gray-500 bg-gray-50' }
  }
  
  switch (priority) {
    case 1: return { text: 'Low', color: 'border-blue-200 text-blue-600 bg-blue-50' }
    case 2: return { text: 'Medium', color: 'border-orange-200 text-orange-600 bg-orange-50' }
    case 3: return { text: 'High', color: 'border-red-200 text-red-600 bg-red-50' }
    default: return { text: 'Not Priority Yet', color: 'border-gray-200 text-gray-500 bg-gray-50' }
  }
}

const getAssignmentDisplay = (supportagentName?: string, technicianId?: string) => {
  if (supportagentName) {
    return { 
      text: `Support: ${supportagentName}`, 
      color: 'bg-blue-100 text-blue-700', 
      icon: UserCheck,
      type: 'support'
    }
  } else if (technicianId) {
    return { 
      text: `Technician: ${technicianId}`, 
      color: 'bg-purple-100 text-purple-700', 
      icon: UserCheck,
      type: 'technician'
    }
  } else {
    return { 
      text: 'Unassigned', 
      color: 'bg-gray-100 text-gray-600', 
      icon: User,
      type: 'unassigned'
    }
  }
}

// Ticket Details Modal Component
function TicketDetailsModal({ ticket, children }: { ticket: any, children: React.ReactNode }) {
  const statusDisplay = getStatusDisplay(ticket.status)
  const isAssigned = !!(ticket.supportagentName || ticket.technicianId)
  const priorityDisplay = getPriorityDisplay(ticket.priority, isAssigned)
  const assignmentDisplay = getAssignmentDisplay(ticket.supportagentName, ticket.technicianId)
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ticket Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{ticket.subject}</h3>
              <p className="text-sm text-muted-foreground mt-1">Ticket ID: {ticket.id}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge className={statusDisplay.color}>{statusDisplay.text}</Badge>
              <Badge className={priorityDisplay.color}>{priorityDisplay.text}</Badge>
              <Badge className={assignmentDisplay.color}>
                <assignmentDisplay.icon className="h-3 w-3 mr-1" />
                {assignmentDisplay.text}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-medium text-foreground mb-2">Description</h4>
            <p className="text-muted-foreground bg-gray-50 p-3 rounded-lg text-sm leading-relaxed">
              {ticket.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  Assignment Information
                </h4>
                <div className="space-y-2">
                  {ticket.supportagentName ? (
                    <div>
                      <span className="text-sm font-medium text-green-800">Support Agent:</span>
                      <p className="text-sm text-green-700">{ticket.supportagentName}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Support Agent:</span>
                      <p className="text-sm text-gray-500">Not assigned</p>
                    </div>
                  )}
                  
                  {ticket.technicianId ? (
                    <div>
                      <span className="text-sm font-medium text-green-800">Technician:</span>
                      <p className="text-sm text-green-700">{ticket.technicianName || 'Unknown Technician'}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Technician:</span>
                      <p className="text-sm text-gray-500">Not assigned</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Timeline
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-purple-800">Created:</span>
                    <p className="text-sm text-purple-700">{new Date(ticket.createdAt).toLocaleString()}</p>
                  </div>
                  
                  {ticket.resolvedAt && (
                    <div>
                      <span className="text-sm font-medium text-purple-800">Resolved:</span>
                      <p className="text-sm text-purple-700">{new Date(ticket.resolvedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

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
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Support Tickets</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any support tickets yet. Create your first ticket to get help with your service.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Ticket
            </Button>
          </div>
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <div className="border border-gray-200 rounded-lg bg-gray-50">
          <div className="h-[calc(100vh-200px)] overflow-y-auto p-4 space-y-4">
            {tickets.map((ticket) => {
              const statusDisplay = getStatusDisplay(ticket.status)
              const isAssigned = !!(ticket.supportagentName || ticket.technicianId)
              const priorityDisplay = getPriorityDisplay(ticket.priority, isAssigned)
              
              return (
                <TicketDetailsModal key={ticket.id} ticket={ticket}>
                  <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium group-hover:text-primary transition-colors">{ticket.subject}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">STATUS</p>
                            <Badge className={`${statusDisplay.color} text-xs mt-1`}>
                              {statusDisplay.text}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">PRIORITY</p>
                            <Badge className={`${priorityDisplay.color} text-xs mt-1`}>
                              {priorityDisplay.text}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">SUPPORT AGENT</p>
                            <p className="mt-1 text-sm text-green-700 font-medium">
                              {ticket.supportagentName || 'Not assigned'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">TECHNICIAN</p>
                            <p className="mt-1 text-sm text-purple-700 font-medium">
                              {ticket.technicianName || 'Not assigned'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">CREATED</p>
                            <p className="mt-1 text-sm text-gray-700 font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TicketDetailsModal>
              )
            })}
          </div>
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

      <NewTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTicketCreated={refreshTickets}
      />
    </div>
  )
}
