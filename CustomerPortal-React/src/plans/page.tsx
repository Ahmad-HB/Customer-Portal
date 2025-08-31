import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useServicePlans } from "@/hooks/useServicePlans"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RefreshCw } from "lucide-react"

export default function PlansPage() {
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const { 
    servicePlans, 
    loading, 
    error, 
    totalCount,
    subscribeToPlan,
    refreshServicePlans 
  } = useServicePlans()

  const handleSubscribe = async (planId: string) => {
    setSubscribingPlanId(planId)
    setSuccessMessage(null)
    setLocalError(null)
    
    try {
      const success = await subscribeToPlan(planId)
      if (success) {
        setSuccessMessage('Successfully subscribed to the service plan!')
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } finally {
      setSubscribingPlanId(null)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Plans</h1>
          {totalCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {totalCount} plan{totalCount !== 1 ? 's' : ''} available
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshServicePlans}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Message */}
      {(error || localError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error || localError}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-2 text-muted-foreground">Loading service plans...</span>
        </div>
      )}

      {/* Plans Grid */}
      {!loading && servicePlans.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No service plans available at the moment.</p>
        </div>
      )}

      {!loading && servicePlans.length > 0 && (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {servicePlans.map((plan) => (
            <Card key={plan.id} className="flex flex-col border border-border">
                          <CardHeader className="text-center">
              <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
              {plan.description && (
                <div className="text-sm text-muted-foreground space-y-2">
                  {plan.description
                    .split('•')
                    .filter(item => item.trim())
                    .map((item, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>{item.trim()}</span>
                      </div>
                    ))}
                </div>
              )}
              <p className="text-2xl font-bold mt-4">${plan.price}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              {/* Empty space to push button to bottom */}
              <div className="flex-1"></div>

                {/* Subscribe Button */}
                <div className="mt-8">
                  <Button 
                    className="w-full rounded-full bg-black text-white hover:bg-gray-800"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribingPlanId === plan.id || loading}
                  >
                    {subscribingPlanId === plan.id ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Subscribing...
                      </div>
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
