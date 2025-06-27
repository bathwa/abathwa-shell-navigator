import { Home, TrendingUp, Users, Settings, ArrowLeft, PieChart, CreditCard, Eye, Menu } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { useState } from 'react'

export const Navigation = () => {
  const { user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          { to: '/investor/portfolio', icon: PieChart, label: 'Portfolio' },
          { to: '/investor/payments', icon: CreditCard, label: 'Payments' },
        ]
      case 'admin':
      case 'super_admin':
        return [
          { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/admin/opportunities/review-list', icon: Eye, label: 'Review Opportunities' },
          { to: '/admin/users', icon: Users, label: 'User Management' },
          { to: '/admin/investment-pools', icon: TrendingUp, label: 'Investment Pools' },
          { to: '/admin/escrow', icon: Settings, label: 'Escrow Management' },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  // Breadcrumbs (example, can be improved)
  const breadcrumbs = [
    { label: 'Home', to: '/' },
    ...location.pathname.split('/').filter(Boolean).map((seg, i, arr) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1),
      to: '/' + arr.slice(0, i + 1).join('/'),
    }))
  ]

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3" data-testid="mobile-menu">
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
              data-testid="back-button"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Button>
          )}
          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center space-x-2" data-testid="breadcrumbs">
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.to}>
                <Link to={crumb.to} className="text-slate-300 hover:text-white transition-colors">
                  {crumb.label}
                </Link>
                {idx < breadcrumbs.length - 1 && <span className="mx-1">/</span>}
              </span>
            ))}
          </div>
          {/* Desktop nav */}
          {!isMobile && navItems.map((item) => {
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
                data-testid={`nav-link-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
        {/* Mobile menu toggle */}
        {isMobile && (
          <button
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setMobileMenuOpen((v) => !v)}
            data-testid="mobile-menu-toggle"
          >
            <Menu size={28} />
          </button>
        )}
        <div className="flex items-center space-x-4">
          <Link
            to="/profile"
            className="text-slate-300 hover:text-white transition-colors"
            data-testid="profile-link"
          >
            Profile
          </Link>
        </div>
      </div>
      {/* Mobile menu items */}
      {isMobile && mobileMenuOpen && (
        <div className="md:hidden mt-2 space-y-2" data-testid="mobile-menu-items">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                data-testid={`nav-link-mobile-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon size={20} className="inline-block mr-2" />
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
