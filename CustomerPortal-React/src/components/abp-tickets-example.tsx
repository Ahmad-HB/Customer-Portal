import { useState } from "react"
import { Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AbpPagination } from "@/components/ui/abp-pagination"
import { useAbpTickets } from "@/hooks/useAbpApi"
import { type Ticket } from "@/lib/api-client"

export function AbpTicketsExample() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  // Using ABP-specific hook with pagination
  const {
    data: ticketsData,
    loading,
    error,
    currentPage,
    totalPages,
    setPage,
    setPageSize,
    setFilter,
    refresh,
  } = useAbpTickets({
    maxResultCount: 10,
    sorting: "creationTime desc",
  })

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filter = value ? `name contains "${value}"` : ""
    setFilter(filter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    const filter = status ? `status eq "${status}"` : ""
    setFilter(filter)
  }

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-orange-100 text-orange-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && !ticketsData) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" text="Loading tickets..." />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading tickets: {error}</p>
            <Button onClick={refresh} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">
            Manage your support tickets
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <Button variant="outline" onClick={refresh}>
              <Filter className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {ticketsData ? `${ticketsData.totalCount} tickets found` : 'Tickets'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center p-4">
              <LoadingSpinner text="Loading..." />
            </div>
          )}

          {ticketsData?.items && ticketsData.items.length > 0 ? (
            <div className="space-y-4">
              {(ticketsData.items as Ticket[]).map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{ticket.name}</h3>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Service Plan: {ticket.servicePlan}</span>
                      <span>Created: {new Date(ticket.creationTime || '').toLocaleDateString()}</span>
                      {ticket.lastModificationTime && (
                        <span>Updated: {new Date(ticket.lastModificationTime).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No tickets found
            </div>
          )}

          {/* ABP Pagination */}
          {ticketsData && (
            <AbpPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={ticketsData.pageSize}
              totalCount={ticketsData.totalCount}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
