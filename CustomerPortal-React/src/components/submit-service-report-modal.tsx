"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, FileText, Loader2 } from "lucide-react"

interface SubmitServiceReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { workPerformed: string }) => void
  isLoading?: boolean
}

export function SubmitServiceReportModal({ isOpen, onClose, onSubmit, isLoading = false }: SubmitServiceReportModalProps) {
  const [workPerformed, setWorkPerformed] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!workPerformed.trim()) return
    
    onSubmit({ workPerformed })
    // Reset form
    setWorkPerformed("")
    onClose()
  }

  const handleCancel = () => {
    // Reset form
    setWorkPerformed("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Submit Service Report</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Describe the work you performed to resolve this ticket
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="work-performed" className="text-sm font-medium text-foreground">
              Work Performed *
            </Label>
            <Textarea
              id="work-performed"
              placeholder="Please provide a detailed description of the work you performed to resolve this ticket. Include any troubleshooting steps, repairs made, or solutions implemented..."
              value={workPerformed}
              onChange={(e) => setWorkPerformed(e.target.value)}
              className="min-h-[150px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Be as detailed as possible to help with future reference and customer communication.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel} 
              className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium py-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium py-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
              disabled={isLoading || !workPerformed.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Submit Report
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
