"use client"

import { useState, useMemo, useEffect } from "react"
import { Plus, FileText, TrendingUp, Users, Clock, CheckCircle, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
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
} from "recharts"

// Enhanced mock data with more vibrant colors and better descriptions
const totals = {
  totalTickets: 1247,
  resolvedTickets: 892,
  withTechnician: 156,
  inProgress: 199,
}

const statusDistribution = [
  {
    name: "Open",
    value: 45,
    fill: "#6366F1", // Indigo
    description: "New tickets awaiting assignment",
    icon: "🆕"
  },
  {
    name: "In Progress",
    value: 25,
    fill: "#F59E0B", // Amber
    description: "Tickets currently being worked on",
    icon: "⚡"
  },
  {
    name: "Resolved",
    value: 20,
    fill: "#10B981", // Emerald
    description: "Successfully completed tickets",
    icon: "✅"
  },
  {
    name: "Waiting",
    value: 10,
    fill: "#EF4444", // Red
    description: "Tickets waiting for customer response",
    icon: "⏳"
  },
]

const monthlyTrend = [
  { month: "Jan", tickets: 95, color: "#6366F1" },
  { month: "Feb", tickets: 120, color: "#8B5CF6" },
  { month: "Mar", tickets: 70, color: "#EC4899" },
  { month: "Apr", tickets: 145, color: "#F59E0B" },
  { month: "May", tickets: 118, color: "#10B981" },
  { month: "Jun", tickets: 135, color: "#EF4444" },
]

export default function AdminDashboardPage() {
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [animateCards, setAnimateCards] = useState(false)
  const [animateCharts, setAnimateCharts] = useState(false)

  const donutTotal = useMemo(() => statusDistribution.reduce((s, d) => s + d.value, 0), [])

  // Staggered animations
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimateCards(true), 100)
    const timer2 = setTimeout(() => setAnimateCharts(true), 500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const handleCreateReport = () => {
    // Handle report creation logic here
    console.log("Creating report from", startDate, "to", endDate)
    setIsCreateReportModalOpen(false)
    setStartDate("")
    setEndDate("")
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
                  domain={[0, 200]}
                  tick={{ fontSize: 14, fill: "#6B7280" }} 
                  axisLine={{ stroke: "#E5E7EB" }} 
                />

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <DialogTitle className="text-lg font-semibold">Create New Monthly Summary Report</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Generate a comprehensive monthly summary report for the selected period</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-sm font-medium">
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-start text-left font-normal text-base px-4"
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {startDate ? format(new Date(startDate), "PPP") : "Pick a date"}
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
                        className="w-full h-12 justify-start text-left font-normal text-base px-4"
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {endDate ? format(new Date(endDate), "PPP") : "Pick a date"}
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
                disabled={!startDate || !endDate}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


