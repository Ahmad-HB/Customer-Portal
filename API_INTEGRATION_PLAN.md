# API Integration Plan for Customer Portal

## Current State Analysis

### ✅ What's Already Working
1. **Authentication System**
   - Login functionality is implemented and working
   - Logout functionality is implemented and working
   - AuthContext provides authentication state management
   - Protected routes are working correctly

2. **Frontend Structure**
   - React + TypeScript + Vite setup is complete
   - UI components are built using shadcn/ui
   - Routing is set up with React Router
   - Role-based access control is implemented

3. **Backend API Structure**
   - ABP.io framework is properly configured
   - Application services are implemented for:
     - Support Tickets
     - Service Plans
     - User Management
     - Reports
     - Email Services
   - DTOs are defined for all entities

### ❌ What's Missing

## 1. Sign Up API Integration

**Current Issue**: The signup page exists but the API call is not properly connected to the backend.

**What needs to be done**:
- Update the `register` function in `api-client.ts` to match ABP.io's registration endpoint
- Ensure the registration payload matches the backend DTO structure
- Handle registration success/failure properly
- Add proper error handling for validation errors

**Backend Endpoint**: `/api/account/register`
**Backend Service**: `CustomAccountAppService.RegisterAsync()`

## 2. Support Tickets API Integration

**Current Issue**: The tickets page shows static data instead of fetching from the API.

**What needs to be done**:
- Implement `getTickets()` API call to fetch user's tickets
- Implement `createTicket()` API call for new ticket creation
- Update the tickets page to use real data from the API
- Add loading states and error handling
- Implement ticket status updates

**Backend Endpoints**:
- `GET /api/app/support-ticket` - Get user's tickets
- `POST /api/app/support-ticket` - Create new ticket
- `PUT /api/app/support-ticket/{id}` - Update ticket
- `DELETE /api/app/support-ticket/{id}` - Delete ticket

**Backend Service**: `SupportTicketAppService`

## 3. Service Plans API Integration

**Current Issue**: The plans page shows static data instead of fetching from the API.

**What needs to be done**:
- Implement `getServicePlans()` API call to fetch available plans
- Implement subscription functionality
- Update the plans page to use real data from the API
- Add loading states and error handling

**Backend Endpoints**:
- `GET /api/app/service-plan` - Get available service plans
- `POST /api/app/service-plan/subscribe` - Subscribe to a plan

**Backend Service**: `ServicePlanAppService`

## 4. User Profile API Integration

**Current Issue**: Profile management is not connected to the backend.

**What needs to be done**:
- Implement `getCurrentUser()` API call properly
- Implement `updateUser()` API call for profile updates
- Update the profile page to use real user data
- Add profile editing functionality

**Backend Endpoints**:
- `GET /api/account/my-profile` - Get current user profile
- `PUT /api/account/my-profile` - Update user profile

## 5. Role-Based Features

**Current Issue**: Different user roles (technician, support agent, admin) need specific API integrations.

**What needs to be done**:
- Implement technician-specific endpoints for assigned tickets
- Implement support agent endpoints for ticket management
- Implement admin endpoints for user management and reports
- Add role-based UI components and navigation

## Implementation Strategy

### Phase 1: Core API Integration (Priority 1)
1. **Fix Sign Up API**
   - Update registration endpoint
   - Test registration flow
   - Add proper error handling

2. **Implement Tickets API**
   - Connect tickets listing
   - Implement ticket creation
   - Add ticket management features

3. **Implement Service Plans API**
   - Connect plans listing
   - Implement subscription functionality

### Phase 2: User Management (Priority 2)
1. **Profile Management**
   - Connect user profile data
   - Implement profile editing
   - Add avatar/photo upload

2. **User Settings**
   - Password change functionality
   - Email preferences
   - Notification settings

### Phase 3: Advanced Features (Priority 3)
1. **Role-Based Features**
   - Technician dashboard
   - Support agent tools
   - Admin panel

2. **Reports and Analytics**
   - PDF report generation
   - Dashboard analytics
   - Export functionality

## Technical Considerations

### API Client Updates Needed
- Update endpoint URLs to match ABP.io conventions
- Add proper error handling for ABP.io error responses
- Implement proper authentication token management
- Add request/response interceptors for common headers

### Data Mapping
- Ensure frontend types match backend DTOs
- Handle ABP.io specific response formats
- Map entity relationships properly

### Error Handling
- Handle ABP.io validation errors
- Implement proper error messages
- Add retry mechanisms for failed requests

### Security
- Ensure proper CORS configuration
- Implement secure token storage
- Add request validation

## Next Steps

1. **Start with Phase 1** - Fix the signup API and implement basic tickets/plans integration
2. **Test thoroughly** - Ensure all API calls work with the actual backend
3. **Add error handling** - Implement proper error states and user feedback
4. **Optimize performance** - Add caching and loading states
5. **Add advanced features** - Implement role-based functionality

## Files to Modify

### Frontend Files
- `src/lib/api-client.ts` - Update API endpoints and error handling
- `src/contexts/AuthContext.tsx` - Improve authentication flow
- `src/tickets/page.tsx` - Connect to real API data
- `src/plans/page.tsx` - Connect to real API data
- `src/profile/page.tsx` - Connect to real user data

### New Files to Create
- `src/hooks/useTickets.ts` - Custom hook for tickets management
- `src/hooks/useServicePlans.ts` - Custom hook for service plans
- `src/types/api.ts` - Centralized API types
- `src/utils/api-helpers.ts` - API utility functions

This plan provides a clear roadmap for connecting your React frontend with the ABP.io backend API. The implementation should be done incrementally, starting with the core functionality and building up to more advanced features.
