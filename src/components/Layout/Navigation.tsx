import { Home, TrendingUp, Users, Settings, ArrowLeft } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'

export const Navigation = () => {
  const { user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  if (!user) return null

  const getNavItems = () => {
    switch (user.role) {
      case 'entrepreneur':
        return [
          { to: '/entrepreneur/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/entrepreneur/opportunities/new', icon: TrendingUp, label: 'Create Opportunity' },
        ]
      case 'investor':
        return [
          { to: '/investor/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/opportunities', icon: TrendingUp, label: 'Browse Opportunities' },
        ]
      case 'admin':
      case 'super_admin':
        return [
          { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/admin/users', icon: Users, label: 'User Management' },
          { to: '/admin/investment-pools', icon: TrendingUp, label: 'Investment Pools' },
          { to: '/admin/escrow', icon: Settings, label: 'Escrow Management' },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-6">
          {/* Back button for non-home pages */}
          {location.pathname !== '/' && location.pathname !== '/entrepreneur/dashboard' && 
           location.pathname !== '/investor/dashboard' && location.pathname !== '/admin/dashboard' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-slate-300 hover:text-white"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Button>
          )}
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
        
        <div className="flex items-center space-x-4">
          <Link
            to="/profile"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  )
}
