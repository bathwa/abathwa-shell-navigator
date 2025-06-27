
import { Header } from './Header'
import { Navigation } from './Navigation'
import { MobileHeader } from './MobileHeader'
import { MobileNavigation } from './MobileNavigation'
import { useIsMobile } from '@/hooks/use-mobile'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const isMobile = useIsMobile()

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {isMobile ? <MobileHeader /> : <Header />}
      {!isMobile && <Navigation />}
      
      <main className={`w-full ${
        isMobile 
          ? 'pb-20 px-4 py-4' // Add bottom padding for mobile nav
          : 'max-w-7xl mx-auto px-6 py-8'
      }`}>
        <div className={isMobile ? 'space-y-4' : ''}>
          {children}
        </div>
      </main>
      
      {isMobile && <MobileNavigation />}
    </div>
  )
}
