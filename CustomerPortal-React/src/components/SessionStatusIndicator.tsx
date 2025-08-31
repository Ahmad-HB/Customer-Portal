import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

export function SessionStatusIndicator() {
  const { sessionStatus, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  const getStatusConfig = () => {
    switch (sessionStatus) {
      case 'active':
        return {
          label: 'Session Active',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          iconClassName: 'text-green-600'
        }
      case 'expired':
        return {
          label: 'Session Expired',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          iconClassName: 'text-red-600'
        }
      case 'checking':
        return {
          label: 'Checking Session',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          iconClassName: 'text-yellow-600'
        }
      default:
        return {
          label: 'No Session',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          iconClassName: 'text-gray-600'
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  return (
    <div className="flex items-center gap-2">
      <IconComponent className={`h-4 w-4 ${config.iconClassName}`} />
      <Badge 
        variant={config.variant} 
        className={`text-xs font-medium ${config.className}`}
      >
        {config.label}
      </Badge>
    </div>
  )
}
