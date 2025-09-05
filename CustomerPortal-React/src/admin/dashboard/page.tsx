"use client"

import { useState, useMemo, useEffect } from "react"
import { Plus, FileText, TrendingUp, Users, Clock, CheckCircle, Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { apiClient } from "@/lib/api-client"
import { ColorScheme } from "@/lib/color-scheme"
import {
  PieChart,
  Pie,
  Cell,
  Label as RechartsLabel,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Scatter,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

// Interface for ticket data
interface Ticket {
  id: string
  subject: string
  description: string
  status: number
  priority: number
  createdAt: string
  resolvedAt?: string
  technicianId?: string
  supportagentId?: string
}

// Custom tooltip component for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.fill }}
          />
          <span className="font-semibold text-gray-800">{data.name}</span>
        </div>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">{data.value}%</span> of total tickets
        </p>
        <p className="text-xs text-gray-500">{data.description}</p>
      </div>
    )
  }
  return null
}

// Custom tooltip component for scatter chart
const CustomScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color }}
          />
          <span className="font-semibold text-gray-800">{data.month}</span>
        </div>
        <p className="text-sm text-gray-600">
          <span className="font-medium">{data.tickets}</span> tickets created
        </p>
      </div>
    )
  }
  return null
}

export default function AdminDashboardPage() {
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [animateCards, setAnimateCards] = useState(false)
  const [animateCharts, setAnimateCharts] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState("")
  const [reportSuccess, setReportSuccess] = useState("")

  // Calculate statistics from real ticket data
  const totals = useMemo(() => {
    const totalTickets = tickets.length
    const resolvedTickets = tickets.filter(t => t.status === 3 || t.status === 4).length
    const withTechnician = tickets.filter(t => t.technicianId).length
    const inProgress = tickets.filter(t => t.status === 2).length
    
    return {
      totalTickets,
      resolvedTickets,
      withTechnician,
      inProgress
    }
  }, [tickets])

  // Calculate status distribution from real data
  const statusDistribution = useMemo(() => {
    const total = tickets.length
    if (total === 0) return []
    
    const open = tickets.filter(t => t.status === 1).length
    const inProgress = tickets.filter(t => t.status === 2).length
    const resolved = tickets.filter(t => t.status === 3).length
    const closed = tickets.filter(t => t.status === 4).length
    
    return [
      {
        name: "Open",
        value: Math.round((open / total) * 100),
        fill: "#6366F1",
        description: "New tickets awaiting assignment",
        icon: "🆕"
      },
      {
        name: "In Progress",
        value: Math.round((inProgress / total) * 100),
        fill: "#F59E0B",
        description: "Tickets currently being worked on",
        icon: "⚡"
      },
      {
        name: "Resolved",
        value: Math.round((resolved / total) * 100),
        fill: "#10B981",
        description: "Successfully completed tickets",
        icon: "✅"
      },
      {
        name: "Closed",
        value: Math.round((closed / total) * 100),
        fill: "#EF4444",
        description: "Closed tickets",
        icon: "🔒"
      },
    ].filter(item => item.value > 0)
  }, [tickets])

  // Calculate monthly trend from real ticket data
  const monthlyTrend = useMemo(() => {
    const now = new Date()
    const months = []
    const colors = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#EF4444"]
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      
      // Count tickets created in this month
      const ticketsInMonth = tickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt)
        return ticketDate.getFullYear() === date.getFullYear() && 
               ticketDate.getMonth() === date.getMonth()
      }).length
      
      months.push({
        month: monthName,
        tickets: ticketsInMonth,
        color: colors[i % colors.length]
      })
    }
    
    return months
  }, [tickets])

  const donutTotal = useMemo(() => tickets.length, [tickets])

  // Fetch tickets data
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        setError("")
        const response = await apiClient.getSupportTickets()
        
        if (response.success && response.data) {
          setTickets(response.data.items || [])
        } else {
          setError("Failed to load ticket data")
        }
      } catch (err) {
        console.error("Error fetching tickets:", err)
        setError("Failed to load ticket data")
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  // Staggered animations
  useEffect(() => {
    if (!loading) {
      const timer1 = setTimeout(() => setAnimateCards(true), 100)
      const timer2 = setTimeout(() => setAnimateCharts(true), 500)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [loading])

  const handleCreateReport = async () => {
    if (!startDate || !endDate) {
      setReportError("Please select both start and end dates")
      return
    }

    setReportLoading(true)
    setReportError("")
    setReportSuccess("")

    try {
      // Format dates for API (MM/dd/yyyy format)
      const formattedStartDate = format(new Date(startDate), "MM/dd/yyyy")
      const formattedEndDate = format(new Date(endDate), "MM/dd/yyyy")
      
      const response = await apiClient.generateSummaryReport(formattedStartDate, formattedEndDate)
      
      if (response.success) {
        setReportSuccess("Report generated and downloaded successfully!")
        // Close modal after a short delay
        setTimeout(() => {
          setIsCreateReportModalOpen(false)
          setStartDate("")
          setEndDate("")
          setReportSuccess("")
        }, 2000)
      } else {
        setReportError(response.message || "Failed to generate report")
      }
    } catch (err) {
      console.error("Error generating report:", err)
      setReportError("Failed to generate report. Please try again.")
    } finally {
      setReportLoading(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading dashboard data...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className={`p-6 ${ColorScheme.alerts.error.bg} border ${ColorScheme.alerts.error.border} rounded-lg max-w-md`}>
            <p className={`${ColorScheme.alerts.error.text} text-center`}>{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button
          className="rounded-full bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsCreateReportModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={`border-border transition-all duration-700 ease-out ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-gray-600">Total Tickets</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{totals.totalTickets}</p>
            <p className="text-sm text-gray-500 mt-1">All time tickets</p>
          </CardContent>
        </Card>

        <Card className={`border-border transition-all duration-700 ease-out delay-100 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-gray-600">Resolved Tickets</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{totals.resolvedTickets}</p>
            <p className="text-sm text-gray-500 mt-1">Successfully closed</p>
          </CardContent>
        </Card>

        <Card className={`border-border transition-all duration-700 ease-out delay-200 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-gray-600">With Technician</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-600">{totals.withTechnician}</p>
            <p className="text-sm text-gray-500 mt-1">Assigned to tech</p>
          </CardContent>
        </Card>

        <Card className={`border-border transition-all duration-700 ease-out delay-300 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-gray-600">In Progress</CardTitle>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-amber-600">{totals.inProgress}</p>
            <p className="text-sm text-gray-500 mt-1">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ticket Status Distribution */}
        <Card className={`transition-all duration-1000 ease-out ${animateCharts ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
          }`}>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Ticket Status Distribution</CardTitle>
            <CardDescription className="text-gray-600">Current breakdown of ticket statuses across the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-8">
              {/* Bigger Pie Chart */}
              <div className="flex-1 flex justify-center">
                <PieChart width={400} height={400}>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={160}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={2000}
                    animationBegin={500}
                    animationEasing="ease-out"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        stroke="#ffffff"
                        strokeWidth={3}
                      />
                    ))}
                    <RechartsLabel
                      content={({ viewBox }) => {
                        const { cx, cy } = viewBox as { cx: number; cy: number }
                        return (
                          <text
                            x={cx}
                            y={cy}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="text-xl font-medium text-gray-700"
                          >
                            Total
                            <tspan x={cx} dy="1.8em" className="text-3xl font-bold text-gray-900">
                              {donutTotal}
                            </tspan>
                          </text>
                        )
                      }}
                    />
                  </Pie>
                </PieChart>
              </div>

              {/* Enhanced Category Specifications */}
              <div className="flex-1 space-y-4">
                <h4 className="font-bold text-gray-800 text-lg mb-4">Category Details</h4>
                {statusDistribution.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-4 p-3 transition-all duration-700 ease-out ${animateCharts ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                      }`}
                    style={{
                      animationDelay: `${600 + index * 150}ms`
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: item.fill }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">{item.name}</span>
                        <span className="text-lg font-bold text-gray-600">{item.value}%</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Tickets Trend */}
        <Card
          className={`transition-all duration-1000 ease-out delay-300 ${animateCharts
              ? "translate-x-0 opacity-100"
              : "translate-x-8 opacity-0"
            }`}
        >
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              Monthly Tickets Trend
            </CardTitle>
            <CardDescription className="text-gray-600">
              Ticket volume trends over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  type="category"
                  tick={{ fontSize: 14, fill: "#6B7280" }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  type="number"
                  domain={[0, Math.max(...monthlyTrend.map(m => m.tickets), 10)]}
                  tick={{ fontSize: 14, fill: "#6B7280" }} 
                  axisLine={{ stroke: "#E5E7EB" }} 
                />
                <Tooltip content={<CustomScatterTooltip />} />

                {/* Big, visible dots with proper colors and animation */}
                <Scatter 
                  dataKey="tickets" 
                  fill="hsl(var(--chart-1))"
                  shape="circle"
                  animationDuration={2000}
                  animationBegin={1000}
                  animationEasing="ease-out"
                >
                  {monthlyTrend.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                    />
                  ))}
                </Scatter>

              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Create New Report Modal */}
      <Dialog open={isCreateReportModalOpen} onOpenChange={setIsCreateReportModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <DialogTitle className="text-lg font-semibold">Create New Monthly Summary Report</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Generate a comprehensive monthly summary report for the selected period</p>
            </div>

            {/* Error Message */}
            {reportError && (
              <div className={`p-4 ${ColorScheme.alerts.error.bg} border ${ColorScheme.alerts.error.border} rounded-lg`}>
                <p className={`${ColorScheme.alerts.error.text} text-sm`}>{reportError}</p>
              </div>
            )}

            {/* Success Message */}
            {reportSuccess && (
              <div className={`p-4 ${ColorScheme.alerts.success.bg} border ${ColorScheme.alerts.success.border} rounded-lg`}>
                <p className={`${ColorScheme.alerts.success.text} text-sm`}>{reportSuccess}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-sm font-medium">
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-start text-left font-normal text-base px-4 min-w-0"
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                        <span className="truncate">
                          {startDate ? format(new Date(startDate), "PPP") : "Pick a date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={8}>
                      <Calendar
                        mode="single"
                        selected={startDate ? new Date(startDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const formattedDate = format(date, "yyyy-MM-dd");
                            setStartDate(formattedDate);
                          }
                        }}
                        className="text-base"
                        classNames={{
                          root: "w-fit text-base",
                          month: "flex flex-col w-full gap-4 text-base",
                          caption: "text-lg font-semibold",
                          nav: "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
                          button_previous: "h-8 w-8 p-0",
                          button_next: "h-8 w-8 p-0",
                          table: "w-full border-collapse",
                          weekdays: "flex",
                          weekday: "text-muted-foreground rounded-md flex-1 font-normal text-sm select-none p-2",
                          week: "flex w-full mt-2",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-base",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-sm font-medium">
                    End Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-start text-left font-normal text-base px-4 min-w-0"
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                        <span className="truncate">
                          {endDate ? format(new Date(endDate), "PPP") : "Pick a date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={8}>
                      <Calendar
                        mode="single"
                        selected={endDate ? new Date(endDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const formattedDate = format(date, "yyyy-MM-dd");
                            setEndDate(formattedDate);
                          }
                        }}
                        className="text-base"
                        classNames={{
                          root: "w-fit text-base",
                          month: "flex flex-col w-full gap-4 text-base",
                          caption: "text-lg font-semibold",
                          nav: "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
                          button_previous: "h-8 w-8 p-0",
                          button_next: "h-8 w-8 p-0",
                          table: "w-full border-collapse",
                          weekdays: "flex",
                          weekday: "text-muted-foreground rounded-md flex-1 font-normal text-sm select-none p-2",
                          week: "flex w-full mt-2",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-base",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                onClick={handleCreateReport}
                disabled={!startDate || !endDate || reportLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reportLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </div>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


