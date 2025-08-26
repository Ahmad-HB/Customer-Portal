import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AbpPaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
  showTotalCount?: boolean
}

export function AbpPagination({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showTotalCount = true,
}: AbpPaginationProps) {
  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalCount)

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 0; i < 4; i++) {
          pages.push(i)
        }
        pages.push(-1) // Ellipsis
        pages.push(totalPages - 1)
      } else if (currentPage >= totalPages - 3) {
        pages.push(0)
        pages.push(-1) // Ellipsis
        for (let i = totalPages - 4; i < totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(0)
        pages.push(-1) // Ellipsis
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push(-1) // Ellipsis
        pages.push(totalPages - 1)
      }
    }
    
    return pages
  }

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center space-x-6">
        {showTotalCount && (
          <div className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalCount} results
          </div>
        )}
        
        {showPageSizeSelector && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {page === -1 ? (
                <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="h-8 w-8 p-0"
                >
                  {page + 1}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
