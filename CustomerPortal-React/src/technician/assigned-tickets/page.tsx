"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Loader2, Send, User, Calendar, Package, FileText } from "lucide-react"
import { SubmitServiceReportModal } from "@/components/submit-service-report-modal"
import { TicketDetailsModal } from "@/components/ticket-details-modal"
import { apiClient } from "@/lib/api-client"
import { getStatusColor, getPriorityColor, ColorScheme } from "@/lib/color-scheme"

interface Ticket {
  id: string
  subject: string
  description: string
  appUserId: string
  appUserName: string // Customer name
  appUserEmail?: string
  supportagentId?: string
  supportagentName?: string
  supportagentEmail?: string
  technicianId?: string
  technicianName?: string
  technicianEmail?: string
  servicePlanId: string
  servicePlanName: string
  status: number // 1: Open, 2: In Progress, 3: Resolved, 4: Closed
  priority: number // 1: Low, 2: Medium, 3: High
  createdAt: string
  resolvedAt?: string
  isDeleted: boolean
  deleterId?: string
  deletionTime?: string
  lastModificationTime: string
  lastModifierId?: string
  creationTime: string
  creatorId: string
}

export default function AssignedTicketsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "all">("active")
  const [isSubmitReportModalOpen, setIsSubmitReportModalOpen] = useState(false)
  const [isTicketDetailsModalOpen, setIsTicketDetailsModalOpen] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingReport, setSubmittingReport] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch assigned tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.getSupportTickets()
        
        if (response.success && response.data) {
          setTickets(response.data.items || [])
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

    fetchTickets()
  }, [])

  // Helper functions for ticket display
  const getStatusDisplay = (status: number) => {
    switch (status) {
      case 1: return { text: 'Open', color: getStatusColor(1) }
      case 2: return { text: 'In Progress', color: getStatusColor(2) }
      case 3: return { text: 'Resolved', color: getStatusColor(3) }
      case 4: return { text: 'Closed', color: getStatusColor(4) }
      default: return { text: 'Unknown', color: getStatusColor(0) }
    }
  }

  const getPriorityDisplay = (priority: number) => {
    switch (priority) {
      case 1: return { text: 'Low', color: getPriorityColor(1) }
      case 2: return { text: 'Medium', color: getPriorityColor(2) }
      case 3: return { text: 'High', color: getPriorityColor(3) }
      default: return { text: 'Not Set', color: getPriorityColor(0) }
    }
  }

  const getTicketsForTab = () => {
    switch (activeTab) {
      case "active":
        return tickets.filter((ticket) => ticket.status !== 3 && ticket.status !== 4)
      case "completed":
        return tickets.filter((ticket) => ticket.status === 3 || ticket.status === 4)
      case "all":
        return tickets
      default:
        return []
    }
  }

  const filteredTickets = getTicketsForTab()
  const activeCount = tickets.filter((t) => t.status !== 3 && t.status !== 4).length
  const completedCount = tickets.filter((t) => t.status === 3 || t.status === 4).length
  const allCount = tickets.length

  const handleSubmitReport = (ticketId: string) => {
    setSelectedTicketId(ticketId)
    setIsSubmitReportModalOpen(true)
  }

  const handleViewDetails = (ticket: Ticket) => {
    // Convert our Ticket interface to the format expected by TicketDetailsModal
    const modalTicket = {
      id: ticket.id,
      title: ticket.subject,
      description: ticket.description,
      customer: ticket.appUserName,
      created: new Date(ticket.createdAt).toLocaleDateString(),
      plan: ticket.servicePlanName,
      status: getStatusDisplay(ticket.status).text,
      priority: getPriorityDisplay(ticket.priority).text,
      resolved: ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleDateString() : undefined,
      supportAgent: ticket.supportagentName,
      supportAgentEmail: ticket.supportagentEmail,
      technician: ticket.technicianName,
      technicianEmail: ticket.technicianEmail
    }
    setSelectedTicket(modalTicket as any)
    setIsTicketDetailsModalOpen(true)
  }

  const handleReportSubmit = async (data: { workPerformed: string }) => {
    if (!selectedTicketId) return
    
    try {
      setSubmittingReport(true)
      setError(null)
      
      const response = await apiClient.submitTechnicianReport(selectedTicketId, data.workPerformed)
      
      if (response.success) {
        // PDF download is handled automatically in the API client
        setIsSubmitReportModalOpen(false)
        setSelectedTicketId(null)
        // Optionally refresh tickets after successful submission
        const ticketsResponse = await apiClient.getSupportTickets()
        if (ticketsResponse.success && ticketsResponse.data) {
          setTickets(ticketsResponse.data.items || [])
        }
      } else {
        setError(response.message || 'Failed to generate report')
      }
    } catch (err) {
      setError('Failed to generate report')
      console.error('Error generating report:', err)
    } finally {
      setSubmittingReport(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Assigned Tickets</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`mb-6 p-4 ${ColorScheme.alerts.error.bg} border ${ColorScheme.alerts.error.border} rounded-lg`}>
          <p className={`${ColorScheme.alerts.error.text} text-sm`}>{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
            activeTab === "active"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Active Tickets ({activeCount})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
            activeTab === "completed"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Completed ({completedCount})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
            activeTab === "all"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All Tickets ({allCount})
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-muted-foreground">Loading assigned tickets...</span>
            </div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-card border rounded-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {activeTab === "completed" ? "No completed tickets" : "No tickets"}
            </h3>
            <p className="text-muted-foreground">
              {activeTab === "completed"
                ? "You haven't completed any tickets yet."
                : "No tickets assigned to you at the moment."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              const statusDisplay = getStatusDisplay(ticket.status)
              const priorityDisplay = getPriorityDisplay(ticket.priority)
              
              return (
                <Card key={ticket.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {/* Ticket Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {ticket.subject}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {ticket.description}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Badge className={`border ${statusDisplay.color} text-xs px-2 py-1`}>
                          {statusDisplay.text}
                        </Badge>
                        <Badge className={`border ${priorityDisplay.color} text-xs px-2 py-1`}>
                          {priorityDisplay.text}
                        </Badge>
                      </div>
                    </div>

                    {/* Key Information Section */}
                    <div className="flex flex-wrap items-center gap-6 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium text-gray-900">{ticket.appUserName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium text-gray-900">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-medium text-gray-900">{ticket.servicePlanName || 'Unknown'}</span>
                      </div>
                    </div>

                    {/* Customer Contact Information Section */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Customer Contact Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2 font-medium text-gray-900">{ticket.appUserEmail || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Support Agent:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {ticket.supportagentName ? (
                              <span className="text-green-700">{ticket.supportagentName}</span>
                            ) : (
                              <span className="text-orange-600">Unassigned</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(ticket)}
                        className="flex items-center gap-2 text-sm border-gray-300 hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      {ticket.status !== 3 && ticket.status !== 4 && (
                        <Button
                          size="sm"
                          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm shadow-sm"
                          onClick={() => handleSubmitReport(ticket.id)}
                        >
                          <Send className="h-4 w-4" />
                          Submit Report
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Submit Service Report Modal */}
      <SubmitServiceReportModal
        isOpen={isSubmitReportModalOpen}
        onClose={() => {
          setIsSubmitReportModalOpen(false)
          setSelectedTicketId(null)
        }}
        onSubmit={handleReportSubmit}
        isLoading={submittingReport}
      />

      {/* Ticket Details Modal */}
      <TicketDetailsModal
        isOpen={isTicketDetailsModalOpen}
        onClose={() => {
          setIsTicketDetailsModalOpen(false)
          setSelectedTicket(null)
        }}
        ticket={selectedTicket}
      />
    </div>
  )
}
