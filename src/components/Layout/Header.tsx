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
    <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-bold text-emerald-500">
          Abathwa Capital
        </Link>
        
        {user && (
          <div className="flex items-center space-x-4">
            <CurrencySelector
              variant="compact"
              showLabel={false}
              className="text-white"
            />
            <Link 
              to="/profile" 
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <User size={20} />
              <span>{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-slate-300 hover:text-red-400 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
