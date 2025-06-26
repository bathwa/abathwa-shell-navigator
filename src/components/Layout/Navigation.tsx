
import { Home, TrendingUp, Users, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export const Navigation = () => {
  const { user } = useAuthStore()
  const location = useLocation()

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
        return [
          { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/admin/users', icon: Users, label: 'User Management' },
          { to: '/admin/settings', icon: Settings, label: 'Settings' },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3">
      <div className="flex items-center space-x-6 max-w-7xl mx-auto">
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
    </nav>
  )
}
