"use client"

import type React from "react"

import { useState } from "react"
import { X, Ticket, FileText, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NewTicketModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewTicketModal({ isOpen, onClose }: NewTicketModalProps) {
  const [formData, setFormData] = useState({
    servicePlan: "",
    subject: "",
    description: "",
    priority: "low",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("New ticket:", formData)
    // Handle form submission here
    onClose()
    setFormData({ servicePlan: "", subject: "", description: "", priority: "low" })
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
          {/* Service Plan Selection */}
          <div className="space-y-2">
            <Label htmlFor="servicePlan" className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4" />
              Service Plan
            </Label>
            <Select
              value={formData.servicePlan}
              onValueChange={(value) => setFormData({ ...formData, servicePlan: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select your service plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Plan - $9.99/month</SelectItem>
                <SelectItem value="premium">Premium Plan - $19.99/month</SelectItem>
                <SelectItem value="enterprise">Enterprise Plan - $49.99/month</SelectItem>
              </SelectContent>
            </Select>
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

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority Level</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Create Ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
