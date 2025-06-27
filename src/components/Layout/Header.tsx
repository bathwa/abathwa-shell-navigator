import { LogOut, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { CurrencySelector } from '@/components/ui/currency-selector'

export const Header = () => {
  const { user, signOut } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-slate-900 border-b border-slate-700 px-4 py-3 sm:px-6 sm:py-4 w-full">
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link to="/" className="text-2xl font-bold text-emerald-500 whitespace-nowrap">
          Abathwa Capital
        </Link>
        
        {user && (
          <div className="flex items-center space-x-2 sm:space-x-4">
            <CurrencySelector
              variant="compact"
              showLabel={false}
              className="text-white"
              data-testid="currency-selector"
            />
            <Link 
              to="/profile" 
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              data-testid="profile-link"
            >
              <User size={20} />
              <span className="hidden xs:inline-block truncate max-w-[80px]">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-slate-300 hover:text-red-400 transition-colors px-2 py-1 rounded-md whitespace-nowrap"
              data-testid="logout-button"
              style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              <LogOut size={20} />
              <span className="hidden xs:inline-block">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
