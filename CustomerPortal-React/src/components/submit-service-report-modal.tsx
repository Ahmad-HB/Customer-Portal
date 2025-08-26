"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface SubmitServiceReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    issueDescription: string
    workPerformed: string
    attachments: string
  }) => void
}

export function SubmitServiceReportModal({ isOpen, onClose, onSubmit }: SubmitServiceReportModalProps) {
  const [issueDescription, setIssueDescription] = useState("")
  const [workPerformed, setWorkPerformed] = useState("")
  const [attachments, setAttachments] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      issueDescription,
      workPerformed,
      attachments,
    })
    // Reset form
    setIssueDescription("")
    setWorkPerformed("")
    setAttachments("")
    onClose()
  }

  const handleCancel = () => {
    // Reset form
    setIssueDescription("")
    setWorkPerformed("")
    setAttachments("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Submit Service Report</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Provide details about the work performed and resolution
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="issue-description" className="text-sm font-medium">
              Issue Description
            </Label>
            <Textarea
              id="issue-description"
              placeholder="Describe the technical issue you found..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="work-performed" className="text-sm font-medium">
              Work Performed
            </Label>
            <Textarea
              id="work-performed"
              placeholder="Detail the work you performed to resolve the issue..."
              value={workPerformed}
              onChange={(e) => setWorkPerformed(e.target.value)}
              className="min-h-[120px] resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments" className="text-sm font-medium">
              Attachments (Optional)
            </Label>
            <Input
              id="attachments"
              placeholder="List any photos, documents, or files (comma-separated)"
              value={attachments}
              onChange={(e) => setAttachments(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-muted-foreground text-background hover:bg-muted-foreground/90">
              Submit Report
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
