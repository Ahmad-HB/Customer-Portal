"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertTriangle } from "lucide-react"

interface SuspendPlanModalProps {
  isOpen: boolean
  onClose: () => void
  onSuspend: (reason: string) => Promise<void>
  planName: string
}

export function SuspendPlanModal({ isOpen, onClose, onSuspend, planName }: SuspendPlanModalProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for suspension")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await onSuspend(reason.trim())
      setReason("")
      onClose()
    } catch (err) {
      setError("Failed to suspend plan. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setReason("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Suspend Service Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-800">
              You are about to suspend <strong>{planName}</strong>. This will temporarily disable the service plan.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for Suspension *
            </Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for suspending this service plan..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={isSubmitting || !reason.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Suspending...
                </div>
              ) : (
                'Suspend Plan'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
