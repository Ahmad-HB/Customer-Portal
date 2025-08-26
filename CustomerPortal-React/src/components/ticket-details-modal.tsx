"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TicketDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: {
    id: string
    title: string
    description: string
    customer: string
    created: string
    plan: string
    status: string
    priority: string
    resolved?: string
  } | null
}

export function TicketDetailsModal({ isOpen, onClose, ticket }: TicketDetailsModalProps) {
  if (!isOpen || !ticket) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Ticket Details</h2>
            <p className="text-sm text-muted-foreground mt-1">Complete ticket information</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Subject</h3>
            <p className="text-sm text-muted-foreground">{ticket.title}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{ticket.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Service Plan</h3>
            <p className="text-sm text-muted-foreground">{ticket.plan} - 2GB data, unlimited calls and texts</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name: </span>
                <span className="text-foreground">John Customer</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="text-foreground">customer@example.com</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone: </span>
                <span className="text-foreground">+1234567890</span>
              </div>
              <div>
                <span className="text-muted-foreground">Address: </span>
                <span className="text-foreground">123 Main St, City, State</span>
              </div>
            </div>
          </div>

          {ticket.resolved && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Resolution Date</h3>
              <p className="text-sm text-muted-foreground">{ticket.resolved}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
