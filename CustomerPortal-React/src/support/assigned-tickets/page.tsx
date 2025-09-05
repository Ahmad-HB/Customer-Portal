"use client"

import { useState, useEffect } from "react"
import { Clock, User, Calendar, Package, Eye, ChevronDown, Send, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoleBasedAccess } from "@/components/RoleBasedAccess"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { apiClient } from "@/lib/api-client"

// Ticket Priority enum matching backend
const TicketPriority = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4
} as const

type TicketPriorityType = typeof TicketPriority[keyof typeof TicketPriority]

// Ticket interface matching API response
interface Ticket {
  id: string
  appUserId: string
  appUserName: string
  appUserEmail?: string
  supportagentId?: string
  supportagentName?: string
  supportagentEmail?: string
  technicianId?: string | null
  technicianName?: string
  technicianEmail?: string
  identityUserName?: string | null
  servicePlanId: string
  servicePlanName?: string | null
  subject: string
  description: string
  priority: number
  status: number
  createdAt: string
  resolvedAt?: string | null
  isDeleted: boolean
  deleterId?: string | null
  deletionTime?: string | null
  lastModificationTime?: string | null
  lastModifierId?: string | null
  creationTime: string
  creatorId: string
}

// Technician interface matching API response
interface Technician {
  id: string
  name: string
  email: string
  phoneNumber: string
  userType: number
  isActive: boolean
  supportTickets: any[]
  userServicePlans: any[]
  isDeleted: boolean
  deleterId: string | null
  deletionTime: string | null
  lastModificationTime: string | null
  lastModifierId: string | null
  creationTime: string
  creatorId: string | null
}

export default function SupportAssignedTicketsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isTicketDetailsModalOpen, setIsTicketDetailsModalOpen] = useState(false)
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false)
  const [isTechnicianModalOpen, setIsTechnicianModalOpen] = useState(false)
  const [currentTicketForAction, setCurrentTicketForAction] = useState<Ticket | null>(null)
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("")
  
  // API state
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, setTotalCount] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Technicians state
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [techniciansLoading, setTechniciansLoading] = useState(false)

  // Helper functions for status and priority mapping
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
    // Handle priority = 0 or unassigned tickets
    if (priority === 0 || !isAssigned) {
      return { text: 'Not Priority Yet', color: 'bg-gray-100 text-gray-800' }
    }
    switch (priority) {
      case 1: return { text: 'Low', color: 'bg-blue-100 text-blue-800' }
      case 2: return { text: 'Medium', color: 'bg-orange-100 text-orange-800' }
      case 3: return { text: 'High', color: 'bg-red-100 text-red-800' }
      case 4: return { text: 'Critical', color: 'bg-purple-100 text-purple-800' }
      default: return { text: 'Not Priority Yet', color: 'bg-gray-100 text-gray-800' }
    }
  }

  // Fetch tickets from API
  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getSupportTickets()
      
      if (response.success && response.data) {
        setTickets(response.data.items || [])
        setTotalCount(response.data.totalCount || 0)
      } else {
        setError(response.message || 'Failed to fetch tickets')
        setTickets([])
        setTotalCount(0)
      }
    } catch (err) {
      console.error('Error fetching tickets:', err)
      setError('Failed to fetch tickets')
      setTickets([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Fetch technicians from API
  const fetchTechnicians = async () => {
    try {
      setTechniciansLoading(true)
      
      const response = await apiClient.getTechnicians()
      
      if (response.success && response.data) {
        setTechnicians(response.data.items || [])
      } else {
        console.error('Failed to fetch technicians:', response.message)
        setTechnicians([])
      }
    } catch (err) {
      console.error('Error fetching technicians:', err)
      setTechnicians([])
    } finally {
      setTechniciansLoading(false)
    }
  }

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets()
    fetchTechnicians()
  }, [])

  // Helper functions for priority modal
  const getPriorityBadgeColor = (priority: TicketPriorityType | 0) => {
    switch (priority) {
      case 0: return 'bg-gray-100 text-gray-800 border-gray-200'
      case TicketPriority.Low: return 'bg-blue-100 text-blue-800 border-blue-200'
      case TicketPriority.Medium: return 'bg-orange-100 text-orange-800 border-orange-200'
      case TicketPriority.High: return 'bg-red-100 text-red-800 border-red-200'
      case TicketPriority.Critical: return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityLabel = (priority: TicketPriorityType | 0) => {
    switch (priority) {
      case 0: return 'Not Priority Yet'
      case TicketPriority.Low: return 'Low'
      case TicketPriority.Medium: return 'Medium'
      case TicketPriority.High: return 'High'
      case TicketPriority.Critical: return 'Critical'
      default: return 'Unknown'
    }
  }


  // Filter tickets by status (API already filters by support agent assignment)
  const filteredTickets = tickets.filter(ticket => {
    switch (activeTab) {
      case 'active':
        return ticket.status === 1 || ticket.status === 2 // Open or In Progress
      case 'completed':
        return ticket.status === 3 || ticket.status === 4 // Resolved or Closed
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



  const handlePriorityChange = async (priority: TicketPriorityType) => {
    if (currentTicketForAction) {
      setActionLoading(currentTicketForAction.id)
      setError(null)
      setSuccessMessage(null)
      
      try {
        const response = await apiClient.updateTicketPriority(currentTicketForAction.id, priority)
        
        if (response.success) {
          setSuccessMessage('Ticket priority updated successfully!')
          
          // Refresh the tickets data to get the updated priority
          await fetchTickets()
          
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(null), 3000)
        } else {
          setError(response.message || 'Failed to update ticket priority')
        }
      } catch (err) {
        console.error('Error updating priority:', err)
        setError('Failed to update ticket priority')
      } finally {
        setActionLoading(null)
        setIsPriorityModalOpen(false)
        setCurrentTicketForAction(null)
      }
    }
  }

  return (
    <RoleBasedAccess allowedRoles={[3]} fallback={<div>Access Denied</div>}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assigned Tickets</h1>
            <p className="text-muted-foreground">Manage and track assigned support tickets</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
            Active Tickets ({tickets.filter(t => t.status === 1 || t.status === 2).length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed ({tickets.filter(t => t.status === 3 || t.status === 4).length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Tickets ({tickets.length})
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{successMessage}</p>
          </div>
        )}

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
        {!loading && (
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tickets found for the selected filter.</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const statusDisplay = getStatusDisplay(ticket.status)
                const isAssigned = !!(ticket.supportagentId || ticket.supportagentName)
                const priorityDisplay = getPriorityDisplay(ticket.priority, isAssigned)
                
                return (
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
                    <Badge className={`border ${statusDisplay.color}`}>
                      {statusDisplay.text}
                    </Badge>
                    <Badge className={`border ${priorityDisplay.color}`}>
                      {priorityDisplay.text}
                    </Badge>
                    {ticket.technicianId ? (
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
                      <span>Customer: {ticket.appUserName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="h-4 w-4" />
                      <span>Plan: {ticket.servicePlanName || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Technician Assignment:</span>
                    </div>
                    {ticket.technicianId ? (
                      <div className="ml-6 space-y-1">
                        <div className="flex items-center gap-2 text-green-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">Assigned</span>
                        </div>
                        <div className="text-xs text-gray-600 ml-4">
                          <div>Technician: {ticket.technicianName || 'Unknown Technician'}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="ml-6 space-y-1">
                        <div className="flex items-center gap-2 text-orange-600">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm font-medium">No Technician Assigned</span>
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          Click "Assign Technician" to assign a technician
                        </div>
                      </div>
                    )}
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
                  {ticket.technicianId ? (
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
                    onClick={async () => {
                      setActionLoading(ticket.id)
                      setError(null)
                      setSuccessMessage(null)
                      
                      try {
                        let blob
                        let fileName
                        
                        if (ticket.technicianId) {
                          // Ticket has technician assigned - use technician report API
                          blob = await apiClient.generateSupportAgentWithTechnicianReport(ticket.id)
                          fileName = `SupportAgentWithTechnicianReport_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`
                        } else {
                          // Ticket has no technician - use support agent only report API
                          blob = await apiClient.generateSupportAgentTicketReport(ticket.id)
                          fileName = `SupportAgentTicketReport_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`
                        }
                        
                        // Create download link and trigger download
                        const url = window.URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = fileName
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        window.URL.revokeObjectURL(url)
                        
                        setSuccessMessage(`Report downloaded successfully for ticket: ${ticket.subject}`)
                        setTimeout(() => setSuccessMessage(null), 3000)
                      } catch (err) {
                        console.error('Error generating report:', err)
                        setError('Failed to generate report')
                      } finally {
                        setActionLoading(null)
                      }
                    }}
                    disabled={actionLoading === ticket.id}
                  >
                    {actionLoading === ticket.id ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Generating...
                      </div>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Report
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => handleAssignPriority(ticket)}
                    disabled={actionLoading === ticket.id}
                  >
                    {actionLoading === ticket.id ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Updating...
                      </div>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Assign Priority
                      </>
                    )}
                  </Button>

                </div>
              </CardContent>
            </Card>
                )
              })
            )}
          </div>
        )}

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
                  <p className="text-gray-600">{selectedTicket.servicePlanName || 'Unknown'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {selectedTicket.appUserName}</p>
                      <p><strong>Email:</strong> {selectedTicket.appUserEmail || 'Not available'}</p>
                      <p><strong>Ticket Created:</strong> {new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Ticket Information</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Status:</strong> {getStatusDisplay(selectedTicket.status).text}</p>
                      <p><strong>Priority:</strong> {getPriorityDisplay(selectedTicket.priority, !!(selectedTicket.supportagentId || selectedTicket.supportagentName)).text}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Technician Assignment</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {selectedTicket.technicianId ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p><strong>Status:</strong> Assigned</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <p><strong>Status:</strong> Not assigned</p>
                      </div>
                    )}
                    {selectedTicket.technicianId && (
                      <div className="space-y-1">
                        <p><strong>Technician:</strong> {selectedTicket.technicianName || 'Unknown Technician'}</p>
                        <p><strong>Email:</strong> {selectedTicket.technicianEmail || 'Not available'}</p>
                      </div>
                    )}
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
                    disabled={actionLoading === currentTicketForAction?.id}
                  >
                    {actionLoading === currentTicketForAction?.id ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Updating...
                      </div>
                    ) : (
                      <>
                        <Badge className={`border mr-2 ${getPriorityBadgeColor(priority)}`}>
                          {getPriorityLabel(priority)}
                        </Badge>
                        {getPriorityLabel(priority)} Priority
                      </>
                    )}
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
                   {techniciansLoading ? (
                     <div className="flex items-center justify-center py-4">
                       <LoadingSpinner size="sm" />
                       <span className="ml-2 text-sm text-gray-600">Loading technicians...</span>
                     </div>
                   ) : (
                     <Select onValueChange={(value) => {
                       setSelectedTechnicianId(value)
                     }} value={selectedTechnicianId}>
                       <SelectTrigger className="w-full">
                         <SelectValue placeholder="Choose a technician..." />
                       </SelectTrigger>
                       <SelectContent>
                         {technicians.length === 0 ? (
                           <SelectItem value="" disabled>
                             No technicians available
                           </SelectItem>
                         ) : (
                           technicians.map((technician) => (
                             <SelectItem key={technician.id} value={technician.id}>
                               {technician.name} - {technician.email}
                             </SelectItem>
                           ))
                         )}
                       </SelectContent>
                     </Select>
                   )}
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
                   onClick={async () => {
                     if (selectedTechnicianId && currentTicketForAction) {
                       setActionLoading(currentTicketForAction.id)
                       setError(null)
                       setSuccessMessage(null)
                       
                       try {
                         const response = await apiClient.assignTechnicianToTicket(currentTicketForAction.id, selectedTechnicianId)
                         
                         if (response.success) {
                           const technician = technicians.find(t => t.id === selectedTechnicianId)
                           setSuccessMessage(`Technician ${technician?.name || 'Unknown'} assigned successfully!`)
                           setTimeout(() => setSuccessMessage(null), 3000)
                           
                           // Refresh tickets to show updated assignment
                           await fetchTickets()
                           
                           // Close modal and reset state
                           setIsTechnicianModalOpen(false)
                           setCurrentTicketForAction(null)
                           setSelectedTechnicianId("")
                         } else {
                           setError(response.message || 'Failed to assign technician')
                         }
                       } catch (err) {
                         console.error('Error assigning technician:', err)
                         setError('Failed to assign technician')
                       } finally {
                         setActionLoading(null)
                       }
                     }
                   }}
                   disabled={!selectedTechnicianId || actionLoading === currentTicketForAction?.id}
                 >
                   {actionLoading === currentTicketForAction?.id ? (
                     <div className="flex items-center gap-2">
                       <LoadingSpinner size="sm" />
                       Assigning...
                     </div>
                   ) : (
                     'Assign'
                   )}
                 </Button>
               </div>
             </div>
           </DialogContent>
         </Dialog>
      </div>
    </RoleBasedAccess>
  )
}
