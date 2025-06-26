
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const Index = () => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Redirect authenticated users to their appropriate dashboard
  switch (user?.role) {
    case 'entrepreneur':
      return <Navigate to="/entrepreneur/dashboard" replace />
    case 'investor':
      return <Navigate to="/investor/dashboard" replace />
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />
    default:
      return <Navigate to="/" replace />
  }
}

export default Index
