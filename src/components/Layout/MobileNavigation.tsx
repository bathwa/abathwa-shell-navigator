
import { Home, TrendingUp, Users, Settings, PieChart, CreditCard, Eye } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export const MobileNavigation = () => {
  const { user } = useAuthStore()
  const location = useLocation()

  if (!user) return null

  const getNavItems = () => {
    switch (user.role) {
      case 'entrepreneur':
        return [
          { to: '/entrepreneur/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/entrepreneur/opportunities/new', icon: TrendingUp, label: 'Create' },
        ]
      case 'investor':
        return [
          { to: '/investor/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/investor/portfolio', icon: PieChart, label: 'Portfolio' },
          { to: '/investor/payments', icon: CreditCard, label: 'Payments' },
        ]
      case 'admin':
      case 'super_admin':
        return [
          { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/admin/opportunities/review-list', icon: Eye, label: 'Review' },
          { to: '/admin/users', icon: Users, label: 'Users' },
          { to: '/admin/investment-pools', icon: TrendingUp, label: 'Pools' },
          { to: '/admin/escrow', icon: Settings, label: 'Escrow' },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-30 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors min-w-0 flex-1 ${
                isActive 
                  ? 'text-emerald-500 bg-emerald-500/10' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <item.icon size={20} className="flex-shrink-0" />
              <span className="text-xs font-medium truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
