
import { LogOut, User, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { CurrencySelector } from '@/components/ui/currency-selector'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export const MobileHeader = () => {
  const { user, signOut } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-700 px-4 py-3 w-full relative z-50">
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="text-xl font-bold text-emerald-500 flex-shrink-0">
            Abathwa Capital
          </Link>
          
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="text-slate-300 hover:text-white p-2"
              data-testid="mobile-menu-toggle"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && user && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-40 md:hidden">
          <div className="flex flex-col items-center justify-center min-h-screen space-y-8 p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <User size={32} className="text-white" />
              </div>
              <div>
                <p className="text-white text-lg font-medium">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-slate-400 text-sm">{user.email}</p>
              </div>
            </div>

            <div className="space-y-6 w-full max-w-xs">
              <div className="flex flex-col items-center space-y-2">
                <span className="text-slate-300 text-sm">Currency</span>
                <CurrencySelector
                  variant="select"
                  showLabel={false}
                  className="text-white w-full"
                />
              </div>

              <Link 
                to="/profile" 
                className="flex items-center justify-center space-x-3 text-white hover:text-emerald-400 transition-colors py-3 px-4 rounded-lg hover:bg-slate-800 w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={20} />
                <span>Profile Settings</span>
              </Link>

              <Button
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center justify-center space-x-3 text-red-400 hover:text-red-300 border-red-400 hover:border-red-300 hover:bg-red-400/10 py-3 w-full"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
