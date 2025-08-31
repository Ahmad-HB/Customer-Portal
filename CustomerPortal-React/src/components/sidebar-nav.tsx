import { Link, useLocation } from "react-router-dom"
import { useAuth } from '@/contexts/AuthContext'
import { 
  Home, 
  Package, 
  User, 
  Ticket, 
  LogOut, 
  UserCircle, 
  Wrench, 
  BarChart3,
  Users,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SessionStatusIndicator } from './SessionStatusIndicator'

// Define navigation items for each role
const navigationByRole = {
  customer: [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Tickets", href: "/tickets", icon: Ticket },
    { name: "Plans", href: "/plans", icon: Package },
  ],
  technician: [
    { name: "Dashboard", href: "/technician/assigned-tickets", icon: Home },
    { name: "Assigned Tickets", href: "/technician/assigned-tickets", icon: Wrench },
    { name: "Profile", href: "/technician/profile", icon: User },
  ],
  supportAgent: [
    { name: "Dashboard", href: "/support/dashboard", icon: Home },
    { name: "Assigned Tickets", href: "/support/assigned-tickets", icon: Ticket },
    { name: "Reports", href: "/support/reports", icon: BarChart3 },
    { name: "Profile", href: "/support/profile", icon: User },
  ],
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Profile", href: "/admin/profile", icon: User },
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
  const { logout } = useAuth()

  // TODO: This should come from your authentication context/API
  // For now, we'll determine role based on current path
  const getCurrentRole = (): 'customer' | 'technician' | 'supportAgent' | 'admin' => {
    const path = location.pathname
    if (path.startsWith('/admin')) return 'admin'
    if (path.startsWith('/support')) return 'supportAgent'
    if (path.startsWith('/technician')) return 'technician'
    return 'customer'
  }

  const currentRole = getCurrentRole()
  const navigation = navigationByRole[currentRole]
  const profileLink = profileLinksByRole[currentRole]

  const handleLogout = async () => {
    await logout()
    // logout() already handles navigation, so we don't need to navigate here
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
        {/* Session Status Indicator */}
        <div className="px-2">
          <SessionStatusIndicator />
        </div>

        <Link
          to={profileLink}
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
