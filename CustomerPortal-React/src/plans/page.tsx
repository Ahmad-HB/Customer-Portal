import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PlansPage() {
  // Sample plans data matching the screenshot
  const plans = [
    {
      id: 1,
      name: "Name of plan",
      subName: "Sub Name",
      price: "9.99$",
      details: ["Details", "Details", "Details", "Details"],
    },
    {
      id: 2,
      name: "Name of plan",
      subName: "Sub Name",
      price: "9.99$",
      details: ["Details", "Details", "Details", "Details"],
    },
    {
      id: 3,
      name: "Name of plan",
      subName: "Sub Name",
      price: "9.99$",
      details: ["Details", "Details", "Details", "Details"],
    },
  ]

  return (
    <div className="p-8">
      {/* Plans Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col border border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
              <p className="text-muted-foreground">{plan.subName}</p>
              <p className="text-2xl font-bold">{plan.price}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              {/* Details List */}
              <div className="flex-1 space-y-3">
                {plan.details.map((detail, index) => (
                  <p key={index} className="text-foreground">
                    {detail}
                  </p>
                ))}
              </div>

              {/* Subscribe Button */}
              <div className="mt-8">
                <Button className="w-full rounded-full bg-black text-white hover:bg-gray-800">Subscribe</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
