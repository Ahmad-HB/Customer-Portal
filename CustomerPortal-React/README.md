# Customer Portal React

This is a React-based customer portal application converted from a Next.js project. It provides a modern UI for customer and technician management with a **.NET ABP.IO backend integration**.

## Features

- **Customer Portal**: Dashboard, profile management, ticket creation, and plan management
- **Technician Portal**: Assigned tickets management and technician profile
- **Support Agent Portal**: Ticket assignment and management (under development)
- **Admin Portal**: User management and reports (under development)
- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **Responsive Design**: Works on desktop and mobile devices
- **React Router**: Client-side routing for smooth navigation
- **ABP.IO Integration**: Full ABP framework compatibility with pagination, filtering, and audit properties

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI Components**: Radix UI, Lucide React icons
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **State Management**: React Context + Custom Hooks
- **API Client**: ABP.IO optimized fetch-based client with TypeScript
- **Backend**: .NET ABP.IO Framework

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- .NET ABP.IO Backend (optional for full functionality)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your ABP.IO configuration:
   ```env
   VITE_API_BASE_URL=https://localhost:44338
   VITE_CLIENT_ID=Portal_App
   VITE_CLIENT_SECRET=your_client_secret_here
   VITE_APP_NAME=Customer Portal
   VITE_APP_VERSION=1.0.0
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Radix UI based components
│   ├── abp-pagination.tsx # ABP-specific pagination
│   ├── abp-tickets-example.tsx # Example ABP integration
│   ├── sidebar-nav.tsx # Unified role-based navigation
│   └── ...
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom React hooks
│   ├── useApi.ts       # General API hooks
│   ├── useAbpApi.ts    # ABP-specific hooks with pagination
│   └── ...
├── lib/                # Utility functions and API client
│   ├── api-client.ts   # ABP.IO optimized API client
│   └── utils.ts        # Utility functions
├── login/              # Login page
├── signup/             # Signup page
├── profile/            # Customer profile
├── tickets/            # Ticket management
├── plans/              # Plan management
├── technician/         # Technician specific pages
├── support/            # Support agent pages (future)
├── admin/              # Admin pages (future)
└── ...
```

## ABP.IO Integration

### Architecture

The project is specifically designed for **ABP.IO layered architecture** with:

#### 1. **ABP-Optimized API Client** (`src/lib/api-client.ts`)
- **ABP Response Format**: Handles `__abp` responses and error structures
- **Entity Framework Conventions**: Supports ABP entity properties (audit, soft delete)
- **Pagination**: Built-in support for ABP's `SkipCount`/`MaxResultCount` pagination
- **Filtering**: OData-style filtering with ABP conventions
- **Sorting**: ABP sorting parameter support
- **Multi-tenancy**: Ready for ABP multi-tenant applications

#### 2. **Authentication Context** (`src/contexts/AuthContext.tsx`)
- Global authentication state management
- Automatic token persistence
- User role-based access control
- Login/logout functionality

#### 3. **ABP-Specific Hooks** (`src/hooks/useAbpApi.ts`)
- **Paged Results**: `useAbpPagedApi` for paginated data
- **CRUD Operations**: `useAbpCrud` for standard ABP operations
- **Specialized Hooks**: `useAbpTickets`, `useAbpServicePlans`, etc.
- **Pagination Controls**: Built-in page management and filtering

#### 4. **ABP UI Components** (`src/components/ui/abp-pagination.tsx`)
- **ABP Pagination**: Follows ABP pagination conventions
- **Page Size Selector**: Configurable items per page
- **Total Count Display**: Shows "X to Y of Z results"
- **Navigation**: First, previous, next, last page buttons

#### 5. **ABP Entity Types**
- **Audit Properties**: `creationTime`, `creatorId`, `lastModificationTime`, etc.
- **Soft Delete**: `isDeleted`, `deletionTime`, `deleterId`
- **Multi-tenancy**: Ready for tenant-specific data

### ABP.IO API Endpoints

The application expects standard ABP.IO endpoints:

#### Authentication (ABP Identity)
- `POST /connect/token` - OAuth2 token endpoint
- `GET /api/identity/my-profile` - Get current user profile
- `PUT /api/identity/my-profile` - Update user profile

#### Application Services (ABP Convention)
- `GET /api/app/ticket` - Get tickets with pagination
- `POST /api/app/ticket` - Create ticket
- `PUT /api/app/ticket/{id}` - Update ticket
- `DELETE /api/app/ticket/{id}` - Delete ticket
- `GET /api/app/ticket/{id}` - Get ticket details

#### Service Plans
- `GET /api/app/service-plan` - Get service plans with pagination
- `GET /api/app/service-plan/{id}` - Get plan details

#### Role-Specific Endpoints
- **Technician**: `/api/app/technician/assigned-tickets`
- **Support Agent**: `/api/app/support/tickets`, `/api/app/support/ticket/{id}/assign`
- **Admin**: `/api/identity/users`, `/api/app/admin/reports`

#### ABP Utilities
- `GET /api/abp/application-info` - Application information
- `GET /api/multi-tenancy/current-tenant` - Current tenant info

### ABP.IO Usage Examples

#### Using ABP Pagination
```typescript
import { useAbpTickets } from '@/hooks/useAbpApi'

function TicketsPage() {
  const {
    data: ticketsData,
    loading,
    error,
    currentPage,
    totalPages,
    setPage,
    setPageSize,
    setFilter,
    setSorting,
  } = useAbpTickets({
    maxResultCount: 10,
    sorting: "creationTime desc",
  })

  // ABP filtering
  const handleSearch = (value: string) => {
    const filter = value ? `name contains "${value}"` : ""
    setFilter(filter)
  }

  // ABP sorting
  const handleSort = (field: string) => {
    setSorting(`${field} desc`)
  }
}
```

#### Using ABP CRUD Operations
```typescript
import { useAbpTicketCrud } from '@/hooks/useAbpApi'

function TicketManagement() {
  const { loading, error, create, update, remove } = useAbpTicketCrud()

  const handleCreateTicket = async (ticketData) => {
    const response = await create({
      name: "Network Issue",
      description: "Cannot connect to internet",
      priority: "high",
      servicePlan: "Premium Plan",
      customerId: "user-id"
    })
    
    if (response.success) {
      // Ticket created with ABP audit properties
      console.log('Created at:', response.data.creationTime)
    }
  }
}
```

#### Using ABP Pagination Component
```typescript
import { AbpPagination } from '@/components/ui/abp-pagination'

function TicketsList() {
  return (
    <div>
      {/* Tickets list */}
      {ticketsData?.items.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
      
      {/* ABP Pagination */}
      <AbpPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={ticketsData.pageSize}
        totalCount={ticketsData.totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  )
}
```

## Authentication

### ABP.IO Implementation
- **OAuth2 Token Flow**: Standard ABP authentication
- **Identity Integration**: Uses ABP Identity module
- **Role-Based Access**: ABP role and permission system
- **Multi-tenancy**: Ready for ABP multi-tenant applications

### User Roles
- **Customer**: Access to dashboard, profile, tickets, plans
- **Technician**: Access to assigned tickets and profile
- **Support Agent**: Access to ticket management and assignment (future)
- **Admin**: Access to user management and reports (future)

### Demo Credentials
For development/testing:
- Customer: `customer@example.com` / `password`
- Technician: `technician@example.com` / `password`

## Environment Configuration

Create a `.env.local` file with ABP.IO specific variables:

```env
# ABP.IO API Configuration
VITE_API_BASE_URL=https://localhost:44338

# ABP Authentication
VITE_CLIENT_ID=Portal_App
VITE_CLIENT_SECRET=your_client_secret_here

# ABP Application Settings
VITE_APP_NAME=Customer Portal
VITE_APP_VERSION=1.0.0

# ABP Multi-tenancy (if enabled)
VITE_MULTI_TENANCY_ENABLED=false
VITE_TENANT_ID=

# Environment
VITE_NODE_ENV=development
```

## Development Guidelines

### ABP.IO Best Practices

#### Adding New ABP Endpoints

1. **Add ABP Entity Types** in `src/lib/api-client.ts`:
   ```typescript
   export interface MyEntity extends AbpEntity {
     // Your entity properties
   }
   ```

2. **Add API Methods** to ApiClient class:
   ```typescript
   async getMyEntities(params?: AbpPaginationParams): Promise<ApiResponse<AbpPagedResult<MyEntity>>> {
     // ABP pagination parameters
   }
   ```

3. **Create ABP Hook** in `src/hooks/useAbpApi.ts`:
   ```typescript
   export function useAbpMyEntities(params?: AbpPaginationParams) {
     return useAbpPagedApi(apiClient.getMyEntities, params)
   }
   ```

4. **Use in Components** with ABP pagination:
   ```typescript
   const { data, loading, setPage, setFilter } = useAbpMyEntities()
   ```

#### ABP Filtering and Sorting

- **Filtering**: Use OData-style filters: `name contains "search"`, `status eq "open"`
- **Sorting**: Use ABP conventions: `creationTime desc`, `name asc`
- **Pagination**: `skipCount` and `maxResultCount` parameters

#### Error Handling

- **ABP Error Format**: Handles ABP error response structure
- **Validation Errors**: ABP validation error handling
- **Authorization**: Automatic logout on 401 responses

### Type Safety

- **ABP Entity Types**: Full TypeScript support for ABP entities
- **Audit Properties**: Type-safe audit field access
- **Pagination Types**: `AbpPagedResult<T>` for paginated responses
- **API Responses**: `AbpResponse<T>` for ABP response format

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
