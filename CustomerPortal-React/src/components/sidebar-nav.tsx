import { Link, useLocation } from "react-router-dom"
import { 
  Home, 
  Ticket, 
  Package, 
  Wrench, 
  Users, 
  UserCircle, 
  LogOut 
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useCurrentUserRole } from "@/hooks/useAbpApi"

// Navigation items for each role - only show what each role should access
const navigationByRole = {
  customer: [
    { name: "Dashboard", href: "/customer/dashboard", icon: Home },
    { name: "Tickets", href: "/tickets", icon: Ticket },
    { name: "Plans", href: "/plans", icon: Package },
  ],
  technician: [
    { name: "Assigned Tickets", href: "/technician/assigned-tickets", icon: Wrench },
  ],
  supportAgent: [
    { name: "Assigned Tickets", href: "/support/assigned-tickets", icon: Ticket },
  ],
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
  ],
}

// Profile links for each role
const profileLinksByRole = {
  customer: "/profile",
  technician: "/technician/profile",
  supportAgent: "/support/profile",
  admin: "/admin/profile",
}

export function SidebarNav() {
  const location = useLocation()
  const { logout, checkSession } = useAuth()
  const { isLoading: roleLoading, isAdmin, isCustomer, isTechnician, isSupportAgent } = useCurrentUserRole()

  // Simple role determination
  let effectiveRole: keyof typeof navigationByRole = 'customer'
  
  if (isAdmin) effectiveRole = 'admin'
  else if (isTechnician) effectiveRole = 'technician'
  else if (isSupportAgent) effectiveRole = 'supportAgent'
  else if (isCustomer) effectiveRole = 'customer'

  // Get navigation and profile link
  const navigation = navigationByRole[effectiveRole] || []
  const profileLink = profileLinksByRole[effectiveRole] || "/profile"

  // DEBUG: Log what's happening in the sidebar
  console.log('🔍 [Sidebar] Debug Info:', {
    effectiveRole,
    navigationItems: navigation?.map(item => item.name),
    isAdmin,
    isCustomer,
    isTechnician,
    isSupportAgent,
    roleLoading,
    currentPath: location.pathname
  })

  const handleLogout = async () => {
    if (checkSession) {
      checkSession()
    }
    await logout()
  }

  // Show loading state while role is being determined
  if (roleLoading) {
    return (
      <div className="flex h-full w-20 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-20 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex flex-col items-center space-y-4 flex-1 pt-6">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => {
                if (checkSession) {
                  checkSession()
                }
              }}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-sm",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="sr-only">{item.name}</span>
            </Link>
          )
        })}
      </div>

      <div className="flex flex-col items-center space-y-4 pb-6">
        <Link
          to={profileLink}
          onClick={() => {
            if (checkSession) {
              checkSession()
            }
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-sidebar-accent hover:bg-sidebar-primary transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-md"
        >
          <UserCircle className="h-8 w-8 text-sidebar-foreground" />
          <span className="sr-only">Profile Picture</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex h-12 w-12 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-md"
        >
          <LogOut className="h-6 w-6" />
          <span className="sr-only">Logout</span>
        </button>
      </div>
    </div>
  )
}
