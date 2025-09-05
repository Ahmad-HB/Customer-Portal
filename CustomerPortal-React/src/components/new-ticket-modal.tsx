"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Ticket, FileText, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { apiClient } from "@/lib/api-client"

interface NewTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onTicketCreated?: () => void
}

interface ServicePlan {
  id: string;
  name: string;
  description: string;
  price: number;
}

export function NewTicketModal({ isOpen, onClose, onTicketCreated }: NewTicketModalProps) {
  const [formData, setFormData] = useState({
    servicePlanId: "",
    subject: "",
    description: "",
  })
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Fetch service plans when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchServicePlans()
    }
  }, [isOpen])

  const fetchServicePlans = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const response = await apiClient.getServicePlans()
      
      if (response.success && response.data) {
        setServicePlans(response.data.items)
        console.log('Service plans loaded:', response.data.items)
      } else {
        setError(response.message || 'Failed to load service plans')
      }
    } catch (err) {
      console.error('Error fetching service plans:', err)
      setError('Failed to load service plans')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      const response = await apiClient.createSupportTicket({
        servicePlanId: formData.servicePlanId,
        subject: formData.subject,
        description: formData.description
      })

      if (response.success) {
        setSuccess("Support ticket created successfully!")
        setFormData({ servicePlanId: "", subject: "", description: "" })
        
        // Close modal after 2 seconds and refresh tickets
        setTimeout(() => {
          onClose()
          if (onTicketCreated) {
            onTicketCreated()
          }
        }, 2000)
      } else {
        setError(response.message || 'Failed to create support ticket')
      }
    } catch (err) {
      console.error('Error creating support ticket:', err)
      setError('Failed to create support ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-background rounded-2xl shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Ticket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Create New Ticket</h2>
              <p className="text-sm text-muted-foreground">Submit a support request</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {success}
            </div>
          )}

          {/* Service Plan Selection */}
          <div className="space-y-2">
            <Label htmlFor="servicePlan" className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4" />
              Service Plan *
            </Label>
            {isLoading ? (
              <div className="h-12 flex items-center justify-center border border-border rounded-md">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-muted-foreground">Loading service plans...</span>
              </div>
            ) : (
              <Select
                value={formData.servicePlanId}
                onValueChange={(value) => setFormData({ ...formData, servicePlanId: value })}
                required
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your service plan" />
                </SelectTrigger>
                <SelectContent>
                  {servicePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - ${plan.price}/month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Subject
            </Label>
            <Input
              id="subject"
              placeholder="Brief description of your issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="h-12"
              required
            />
          </div>



          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Issue Description
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide detailed information about your issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-32 resize-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 bg-transparent hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              disabled={isSubmitting || !formData.servicePlanId || !formData.subject || !formData.description}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Creating...
                </div>
              ) : (
                "Create Ticket"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
