"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Calendar, Package, Eye } from "lucide-react"
import { SubmitServiceReportModal } from "@/components/submit-service-report-modal"
import { TicketDetailsModal } from "@/components/ticket-details-modal"

interface Ticket {
  id: string
  title: string
  description: string
  customer: string
  created: string
  plan: string
  status: "InProgress" | "High" | "Completed"
  priority: "High" | "Medium" | "Low"
  resolved?: string
}

const mockTickets: Ticket[] = [
  {
    id: "1",
    title: "Internet connection issues",
    description: "My internet keeps disconnecting every few hours. This has been happening for the past week.",
    customer: "Name",
    created: "10/01/2024",
    plan: "Basic Mobile",
    status: "InProgress",
    priority: "High",
  },
]

const completedTickets: Ticket[] = [
  {
    id: "2",
    title: "Internet connection issues",
    description: "My internet keeps disconnecting every few hours. This has been happening for the past week.",
    customer: "Name",
    created: "10/01/2024",
    plan: "Basic Mobile",
    status: "Completed",
    priority: "High",
    resolved: "10/02/2024",
  },
]

export default function AssignedTicketsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "all">("active")
  const [isSubmitReportModalOpen, setIsSubmitReportModalOpen] = useState(false)
  const [isTicketDetailsModalOpen, setIsTicketDetailsModalOpen] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const getTicketsForTab = () => {
    switch (activeTab) {
      case "active":
        return mockTickets.filter((ticket) => ticket.status !== "Completed")
      case "completed":
        return completedTickets.filter((ticket) => ticket.status === "Completed")
      case "all":
        return [...mockTickets, ...completedTickets]
      default:
        return []
    }
  }

  const tickets = getTicketsForTab()
  const activeCount = mockTickets.filter((t) => t.status !== "Completed").length
  const completedCount = completedTickets.length
  const allCount = mockTickets.length + completedTickets.length

  const handleSubmitReport = (ticketId: string) => {
    setSelectedTicketId(ticketId)
    setIsSubmitReportModalOpen(true)
  }

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsTicketDetailsModalOpen(true)
  }

  const handleReportSubmit = (data: {
    issueDescription: string
    workPerformed: string
    attachments: string
  }) => {
    console.log("[v0] Submitting report for ticket:", selectedTicketId, data)
    setSelectedTicketId(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Assigned Tickets</h1>
      </div>

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
        {tickets.length === 0 ? (
          <div className="bg-card border rounded-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Clock className="w-8 h-8 text-muted-foreground" />
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
          tickets.map((ticket) => (
            <div key={ticket.id} className="bg-card border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground">{ticket.title}</h3>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    {ticket.status === "Completed" ? "Completed" : "InProgress"}
                  </Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                    {ticket.priority}
                  </Badge>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{ticket.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Customer: {ticket.customer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Created: {ticket.created}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Plan: {ticket.plan}</span>
                </div>
                {ticket.resolved && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Resolved: {ticket.resolved}</span>
                  </div>
                )}
              </div>

              {/* Customer Contact Information */}
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-foreground mb-3">Customer Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Phone: </span>
                    <span className="text-foreground">+1234567890</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <span className="text-foreground">customer@example.com</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">Address: </span>
                    <span className="text-foreground">123 Main St, City, State</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(ticket)}
                  className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 hover:shadow-sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                {ticket.status !== "Completed" && (
                  <Button
                    size="sm"
                    className="bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 hover:shadow-md"
                    onClick={() => handleSubmitReport(ticket.id)}
                  >
                    Submit Report
                  </Button>
                )}
              </div>
            </div>
          ))
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
