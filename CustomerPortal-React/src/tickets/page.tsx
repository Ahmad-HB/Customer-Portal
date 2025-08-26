"use client"

import { useState } from "react"
import { Plus, Info, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NewTicketModal } from "@/components/new-ticket-modal"

export default function TicketsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sample ticket data matching the screenshot
  const tickets = [
    {
      id: 1,
      name: "Name of Ticket",
      status: "Open",
      priority: "low",
      description: "Brief Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      servicePlan: "Name of Service Plan",
      date: "10/01/2024",
    },
    {
      id: 2,
      name: "Name of Ticket",
      status: "Open",
      priority: "low",
      description: "Brief Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      servicePlan: "Name of Service Plan",
      date: "10/01/2024",
    },
    {
      id: 3,
      name: "Name of Ticket",
      status: "Open",
      priority: "low",
      description: "Brief Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      servicePlan: "Name of Service Plan",
      date: "10/01/2024",
    },
    {
      id: 4,
      name: "Name of Ticket",
      status: "Open",
      priority: "low",
      description: "Brief Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      servicePlan: "Name of Service Plan",
      date: "10/01/2024",
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
        <Button
          className="rounded-full bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Tickets List */}
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
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {ticket.status}
                      </Badge>
                      <Badge variant="outline" className="border-blue-200 text-blue-600">
                        {ticket.priority}
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
                    <span>{ticket.date}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <NewTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
