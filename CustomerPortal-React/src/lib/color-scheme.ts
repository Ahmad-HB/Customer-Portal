// Unified Color Scheme for the Customer Portal System
// This ensures consistent color coding across all components

export const ColorScheme = {
  // Status Colors (Tickets)
  status: {
    open: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    inProgress: 'bg-blue-100 text-blue-800 border-blue-200', 
    resolved: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
    unknown: 'bg-gray-100 text-gray-800 border-gray-200'
  },

  // Priority Colors
  priority: {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-orange-100 text-orange-800 border-orange-200',
    high: 'bg-red-100 text-red-800 border-red-200',
    critical: 'bg-purple-100 text-purple-800 border-purple-200',
    notSet: 'bg-gray-100 text-gray-800 border-gray-200'
  },

  // Assignment Status Colors
  assignment: {
    assigned: 'bg-green-100 text-green-800 border-green-200',
    unassigned: 'bg-orange-100 text-orange-800 border-orange-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },

  // Role Colors
  roles: {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    supportAgent: 'bg-blue-100 text-blue-800 border-blue-200',
    technician: 'bg-green-100 text-green-800 border-green-200',
    customer: 'bg-gray-100 text-gray-800 border-gray-200'
  },

  // Alert Colors
  alerts: {
    success: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200'
    },
    error: {
      bg: 'bg-red-50', 
      text: 'text-red-800',
      border: 'border-red-200'
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800', 
      border: 'border-yellow-200'
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200'
    }
  },

  // Button Colors
  buttons: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-orange-600 hover:bg-orange-700 text-white',
    outline: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
  },

  // Text Colors
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600', 
    muted: 'text-gray-500',
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-orange-700',
    info: 'text-blue-700'
  },

  // Background Colors
  backgrounds: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    muted: 'bg-gray-100',
    card: 'bg-white',
    overlay: 'bg-black/50'
  }
} as const

// Helper functions for consistent usage
export const getStatusColor = (status: number) => {
  switch (status) {
    case 1: return ColorScheme.status.open
    case 2: return ColorScheme.status.inProgress
    case 3: return ColorScheme.status.resolved
    case 4: return ColorScheme.status.closed
    default: return ColorScheme.status.unknown
  }
}

export const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 1: return ColorScheme.priority.low
    case 2: return ColorScheme.priority.medium
    case 3: return ColorScheme.priority.high
    case 4: return ColorScheme.priority.critical
    default: return ColorScheme.priority.notSet
  }
}

export const getAssignmentColor = (isAssigned: boolean) => {
  return isAssigned ? ColorScheme.assignment.assigned : ColorScheme.assignment.unassigned
}

export const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin': return ColorScheme.roles.admin
    case 'supportagent': 
    case 'support': return ColorScheme.roles.supportAgent
    case 'technician': return ColorScheme.roles.technician
    case 'customer': return ColorScheme.roles.customer
    default: return ColorScheme.roles.customer
  }
}
