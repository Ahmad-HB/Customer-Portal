"use client"

import { useState } from "react"
import { Clock, User, Calendar, Package, Eye, ChevronDown, X, Plus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoleBasedAccess } from "@/components/RoleBasedAccess"

// Ticket Priority enum matching backend
const TicketPriority = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4
} as const

type TicketPriorityType = typeof TicketPriority[keyof typeof TicketPriority]

// Ticket interface
interface Ticket {
  id: string
  subject: string
  description: string
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed'
  priority: TicketPriorityType
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  servicePlan: string
  servicePlanDetails: string
  createdDate: string
  assignedDate: string
  technicianName: string
  technicianEmail: string
  technicianPhone: string
}

// Mock data for support agent assigned tickets
const mockTickets: Ticket[] = [
  {
    id: "1",
    subject: "Internet connection issues",
    description: "My internet keeps disconnecting every few hours. This has been happening for the past week.",
    status: 'InProgress',
    priority: TicketPriority.High,
    customerName: "John Customer",
    customerEmail: "customer@example.com",
    customerPhone: "+1234567890",
    customerAddress: "123 Main St, City, State",
    servicePlan: "Basic Mobile",
    servicePlanDetails: "Basic Mobile - 2GB data, unlimited calls and texts",
    createdDate: "10/01/2024",
    assignedDate: "09/30/2024",
    technicianName: "John Smith",
    technicianEmail: "john.smith@company.com",
    technicianPhone: "+1234567890"
  },
  {
    id: "2",
    subject: "Service plan upgrade request",
    description: "I would like to upgrade my current plan to get more data and better coverage.",
    status: 'Open',
    priority: TicketPriority.Medium,
    customerName: "Sarah Wilson",
    customerEmail: "sarah@example.com",
    customerPhone: "+1234567891",
    customerAddress: "456 Oak Ave, City, State",
    servicePlan: "Premium Mobile",
    servicePlanDetails: "Premium Mobile - 10GB data, unlimited calls and texts",
    createdDate: "10/02/2024",
    assignedDate: "",
    technicianName: "",
    technicianEmail: "",
    technicianPhone: ""
  }
]

// Mock data for available technicians
const availableTechnicians = [
  { id: "1", name: "John Smith", email: "john.smith@company.com", phone: "+1234567890", specialization: "Network Issues" },
  { id: "2", name: "Mike Johnson", email: "mike.johnson@company.com", phone: "+1234567892", specialization: "Service Plans" },
  { id: "3", name: "Sarah Davis", email: "sarah.davis@company.com", phone: "+1234567893", specialization: "Hardware Problems" },
  { id: "4", name: "David Wilson", email: "david.wilson@company.com", phone: "+1234567894", specialization: "Billing Issues" },
  { id: "5", name: "Lisa Brown", email: "lisa.brown@company.com", phone: "+1234567895", specialization: "General Support" }
]

export default function SupportAssignedTicketsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isTicketDetailsModalOpen, setIsTicketDetailsModalOpen] = useState(false)
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false)
  const [isTechnicianModalOpen, setIsTechnicianModalOpen] = useState(false)
  const [currentTicketForAction, setCurrentTicketForAction] = useState<Ticket | null>(null)
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("")

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Open': return 'default'
      case 'InProgress': return 'secondary'
      case 'Resolved': return 'outline'
      case 'Closed': return 'destructive'
      default: return 'default'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'InProgress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'Closed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityBadgeVariant = (priority: TicketPriorityType) => {
    switch (priority) {
      case TicketPriority.Low: return 'default'
      case TicketPriority.Medium: return 'outline'
      case TicketPriority.High: return 'secondary'
      case TicketPriority.Critical: return 'destructive'
      default: return 'default'
    }
  }

  const getPriorityBadgeColor = (priority: TicketPriorityType) => {
    switch (priority) {
      case TicketPriority.Low: return 'bg-blue-100 text-blue-800 border-blue-200'
      case TicketPriority.Medium: return 'bg-green-100 text-green-800 border-green-200'
      case TicketPriority.High: return 'bg-purple-100 text-purple-800 border-purple-200'
      case TicketPriority.Critical: return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityLabel = (priority: TicketPriorityType) => {
    switch (priority) {
      case TicketPriority.Low: return 'Low'
      case TicketPriority.Medium: return 'Medium'
      case TicketPriority.High: return 'High'
      case TicketPriority.Critical: return 'Critical'
      default: return 'Unknown'
    }
  }

  const filteredTickets = mockTickets.filter(ticket => {
    switch (activeTab) {
      case 'active':
        return ticket.status === 'Open' || ticket.status === 'InProgress'
      case 'completed':
        return ticket.status === 'Resolved' || ticket.status === 'Closed'
      case 'all':
        return true
      default:
        return true
    }
  })

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsTicketDetailsModalOpen(true)
  }

  const handleAssignPriority = (ticket: Ticket) => {
    setCurrentTicketForAction(ticket)
    setIsPriorityModalOpen(true)
  }

  const handleAssignTechnician = (ticket: Ticket) => {
    console.log('🔍 [DEBUG] handleAssignTechnician called with ticket:', ticket)
    setCurrentTicketForAction(ticket)
    setIsTechnicianModalOpen(true)
    console.log('🔍 [DEBUG] Modal state set to true')
  }



  const handlePriorityChange = (priority: TicketPriorityType) => {
    if (currentTicketForAction) {
      // TODO: Update ticket priority via API
      console.log(`Updating ticket ${currentTicketForAction.id} priority to ${priority}`)
      setIsPriorityModalOpen(false)
      setCurrentTicketForAction(null)
    }
  }

  return (
    <RoleBasedAccess allowedRoles={[3]} fallback={<div>Access Denied</div>}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assigned Tickets</h1>
          <p className="text-muted-foreground">Manage and track assigned support tickets</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Tickets ({mockTickets.filter(t => t.status === 'Open' || t.status === 'InProgress').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed ({mockTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Tickets ({mockTickets.length})
          </button>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden">
              <CardContent className="p-6">
                {/* Ticket Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Clock className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {ticket.subject}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {ticket.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Badge className={`border ${getStatusBadgeColor(ticket.status)}`}>
                      {ticket.status}
                    </Badge>
                    <Badge variant={getPriorityBadgeVariant(ticket.priority)} className={`border ${getPriorityBadgeColor(ticket.priority)}`}>
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                    {ticket.technicianName ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200 border">
                        <User className="h-3 w-3 mr-1" />
                        Assigned
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200 border">
                        <User className="h-3 w-3 mr-1" />
                        Unassigned
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Customer and Technician Overview */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Customer: {ticket.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {ticket.createdDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="h-4 w-4" />
                      <span>Plan: {ticket.servicePlan}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Technician Assignment:</span>
                    </div>
                    {ticket.technicianName ? (
                      <div className="ml-6 space-y-1">
                        <div className="flex items-center gap-2 text-green-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">Assigned</span>
                        </div>
                        <div className="text-xs text-gray-600 ml-4">
                          <div>{ticket.technicianName}</div>
                          <div>{ticket.technicianEmail}</div>
                          <div>Assigned: {ticket.assignedDate}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="ml-6 space-y-1">
                        <div className="flex items-center gap-2 text-orange-600">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm font-medium">No Technician Assigned</span>
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          Click "Assign New Ticket" to assign a technician
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Contact Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Customer Contact Information</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>Phone: {ticket.customerPhone}</div>
                    <div>Email: {ticket.customerEmail}</div>
                    <div>Address: {ticket.customerAddress}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetails(ticket)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  {ticket.technicianName ? (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 text-green-700 border-green-300 hover:bg-green-50"
                      disabled
                    >
                      <User className="h-4 w-4" />
                      Technician Assigned
                    </Button>
                  ) : (
                    <Button
                      className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-600"
                      onClick={() => handleAssignTechnician(ticket)}
                    >
                      <User className="h-4 w-4" />
                      Assign Technician
                    </Button>
                  )}
                  <Button
                    className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit Report
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => handleAssignPriority(ticket)}
                  >
                    <ChevronDown className="h-4 w-4" />
                    Assign Priority
                  </Button>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ticket Details Modal */}
        <Dialog open={isTicketDetailsModalOpen} onOpenChange={setIsTicketDetailsModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Ticket Details</DialogTitle>
            </DialogHeader>
            
            {selectedTicket && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Subject</h3>
                  <p className="text-gray-600">{selectedTicket.subject}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedTicket.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Service Plan</h3>
                  <p className="text-gray-600">{selectedTicket.servicePlanDetails}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {selectedTicket.customerName}</p>
                      <p><strong>Email:</strong> {selectedTicket.customerEmail}</p>
                      <p><strong>Phone:</strong> {selectedTicket.customerPhone}</p>
                      <p><strong>Address:</strong> {selectedTicket.customerAddress}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Technician Information</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {selectedTicket.technicianName}</p>
                      <p><strong>Email:</strong> {selectedTicket.technicianEmail}</p>
                      <p><strong>Phone:</strong> {selectedTicket.technicianPhone}</p>
                      <p><strong>Assigned Date:</strong> {selectedTicket.assignedDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Assign Priority Modal */}
        <Dialog open={isPriorityModalOpen} onOpenChange={setIsPriorityModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Assign Priority</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Assign priority for ticket: <strong>{currentTicketForAction?.subject}</strong>
              </p>
              
              <div className="space-y-3">
                {([TicketPriority.Low, TicketPriority.Medium, TicketPriority.High, TicketPriority.Critical] as TicketPriorityType[]).map((priority) => (
                  <Button
                    key={priority}
                    variant="outline"
                    className="w-full justify-start hover:bg-gray-50"
                    onClick={() => handlePriorityChange(priority)}
                  >
                    <Badge className={`border mr-2 ${getPriorityBadgeColor(priority)}`}>
                      {getPriorityLabel(priority)}
                    </Badge>
                    {getPriorityLabel(priority)} Priority
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

                 {/* Assign Technician Modal */}
         <Dialog open={isTechnicianModalOpen} onOpenChange={setIsTechnicianModalOpen}>
           <DialogContent className="sm:max-w-md">
             <DialogHeader>
               <DialogTitle className="text-lg font-semibold">Assign Technician</DialogTitle>
             </DialogHeader>
             
             <div className="space-y-4">
               <p className="text-gray-600">
                 Assign technician for ticket: <strong>{currentTicketForAction?.subject}</strong>
               </p>
               
               <div className="space-y-4">
                 <div>
                   <label className="text-sm font-medium text-gray-700 mb-2 block">Select Technician</label>
                                       <Select onValueChange={(value) => {
                      setSelectedTechnicianId(value)
                    }} value={selectedTechnicianId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a technician..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTechnicians.map((technician) => (
                          <SelectItem key={technician.id} value={technician.id}>
                            {technician.name} - {technician.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
               </div>
               
               <div className="flex gap-3 pt-4 border-t border-gray-200">
                 <Button
                   variant="outline"
                   onClick={() => setIsTechnicianModalOpen(false)}
                   className="flex-1"
                 >
                   Cancel
                 </Button>
                 <Button
                   className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex-1 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                   onClick={() => {
                     if (selectedTechnicianId) {
                       const technician = availableTechnicians.find(t => t.id === selectedTechnicianId)
                       if (technician) {
                         // TODO: Update ticket technician via API
                         console.log(`Assigning technician ${technician.name} to ticket ${currentTicketForAction?.id}`)
                         setIsTechnicianModalOpen(false)
                         setCurrentTicketForAction(null)
                         setSelectedTechnicianId("")
                       }
                     }
                   }}
                   disabled={!selectedTechnicianId}
                 >
                   Assign
                 </Button>
               </div>
             </div>
           </DialogContent>
         </Dialog>
      </div>
    </RoleBasedAccess>
  )
}
