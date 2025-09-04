# Role-Based Access Control (RBAC) System

This document describes the role-based access control system implemented in the Customer Portal React application.

## Overview

The RBAC system uses the backend API endpoint `https://localhost:44338/api/app/app-user/current-app-user` to determine the current user's role and restrict access to appropriate pages and functionality based on their user type.

## User Types

The system supports four user types, defined by the backend enum:

```typescript
export const UserType = {
  Admin: 1,           // System administrators
  Customer: 2,        // Regular customers
  SupportAgent: 3,    // Support agents
  Technician: 4       // Field technicians
} as const
```

## API Integration

### New Endpoint
- **URL**: `/api/app/app-user/current-app-user`
- **Method**: GET
- **Authentication**: Uses session cookies/credentials
- **Response**: Returns an `AppUser` DTO with a `userType` field containing the numeric enum value

### AppUser Interface
```typescript
export interface AppUser extends AbpEntity {
  userName: string
  name: string
  email: string
  phoneNumber?: string
  userType: UserTypeValue  // Numeric enum value (1, 2, 3, 4)
  emailConfirmed?: boolean
  phoneNumberConfirmed?: boolean
  lockoutEnabled?: boolean
  lockoutEnd?: string
}
```

## Components

### RoleBasedAccess Component
The main component for controlling access based on user roles:

```tsx
import { RoleBasedAccess } from '@/components/RoleBasedAccess'

<RoleBasedAccess 
  allowedRoles={[1, 2]} // Admin and Customer only
  fallback={<div>Access Denied</div>}
  loadingFallback={<div>Loading...</div>}
>
  <AdminAndCustomerContent />
</RoleBasedAccess>
```

### Convenience Components
Pre-built components for specific roles:

```tsx
import { AdminOnly, CustomerOnly, TechnicianOnly, SupportAgentOnly } from '@/components/RoleBasedAccess'

// Admin only content
<AdminOnly fallback={<div>Admin access required</div>}>
  <AdminDashboard />
</AdminOnly>

// Customer only content
<CustomerOnly fallback={<div>Customer access required</div>}>
  <CustomerDashboard />
</CustomerOnly>
```

## Usage Examples

### 1. Protecting Admin Routes
```tsx
// In admin pages
<RoleBasedAccess allowedRoles={[1]} fallback={<div>Access Denied</div>}>
  <AdminDashboard />
</RoleBasedAccess>
```

### 2. Multi-Role Access
```tsx
// Allow both Admin and Support Agent access
<RoleBasedAccess allowedRoles={[1, 3]} fallback={<div>Access Denied</div>}>
  <SupportDashboard />
</RoleBasedAccess>
```

### 3. Conditional Rendering
```tsx
import { useCurrentAppUser } from '@/hooks/useAbpApi'

function MyComponent() {
  const { isAdmin, isCustomer, isSupportAgent, isTechnician } = useCurrentAppUser()
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      {isCustomer && <CustomerPanel />}
      {isSupportAgent && <SupportPanel />}
      {isTechnician && <TechnicianPanel />}
    </div>
  )
}
```

## Hooks

### useCurrentAppUser Hook
Provides access to the current user's information and role:

```typescript
const { 
  appUser,           // Full AppUser object
  isLoading,         // Loading state
  error,             // Error state
  isAdmin,           // Boolean for admin role
  isCustomer,        // Boolean for customer role
  isSupportAgent,    // Boolean for support agent role
  isTechnician,      // Boolean for technician role
  refetch            // Function to refresh user data
} = useCurrentAppUser()
```

## Route Protection

### App.tsx Routing
Routes are protected using the `ProtectedRoute` component with role-based access:

```tsx
// Admin routes
<Route path="/admin/dashboard" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AppLayout><AdminDashboardPage /></AppLayout>
  </ProtectedRoute>
} />

// Customer routes
<Route path="/tickets" element={
  <ProtectedRoute allowedRoles={['customer']}>
    <AppLayout><TicketsPage /></AppLayout>
  </ProtectedRoute>
} />
```

## Fallback Behavior

When a user doesn't have access to a protected component:

1. **Loading State**: Shows `loadingFallback` while checking user role
2. **No Access**: Shows `fallback` content if user doesn't have required role
3. **Redirect**: Routes automatically redirect users to their appropriate dashboard

## Security Features

1. **Server-Side Validation**: User type is verified against the backend API
2. **Session Management**: Automatic session checking and refresh
3. **Role Persistence**: User role is maintained across page refreshes
4. **Access Denial**: Graceful fallback for unauthorized access attempts

## Implementation Notes

### Backward Compatibility
The system maintains backward compatibility with the existing authentication system while adding the new role-based features.

### Error Handling
- Network errors are handled gracefully
- Invalid user types fall back to customer role
- Loading states prevent unauthorized content flash

### Performance
- User role is cached and only refreshed when necessary
- Components re-render only when role changes
- Efficient role checking using numeric comparisons

## Testing

To test different user roles:

1. **Admin**: Login with admin credentials
2. **Customer**: Login with customer credentials  
3. **Technician**: Login with technician credentials
4. **Support Agent**: Login with support agent credentials

## Future Enhancements

1. **Dynamic Permissions**: Fine-grained permission system
2. **Role Inheritance**: Hierarchical role structure
3. **Audit Logging**: Track access attempts and role changes
4. **Multi-Tenant Support**: Organization-level role management

## Troubleshooting

### Common Issues

1. **"Access Denied" showing for valid users**
   - Check if the API endpoint is accessible
   - Verify user session is valid
   - Check browser console for API errors

2. **Role not updating after login**
   - Clear browser cache and cookies
   - Check if the backend is returning correct userType
   - Verify the API response format

3. **Components not rendering**
   - Ensure RoleBasedAccess component is properly imported
   - Check if allowedRoles array contains correct numeric values
   - Verify the useCurrentAppUser hook is working

### Debug Mode
Enable debug logging by checking the browser console for:
- API request/response logs
- User role extraction logs
- Component access control logs
