
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user) {
    const userRole = user.user_metadata?.role || 'entrepreneur';
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
