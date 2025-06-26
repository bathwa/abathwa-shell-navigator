
import { ArrowRight, TrendingUp, Users, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-2xl font-bold text-emerald-500">
            Abathwa Capital
          </div>
          <div className="space-x-4">
            <Link 
              to="/login" 
              className="text-slate-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Connect <span className="text-emerald-500">Entrepreneurs</span> with <span className="text-emerald-500">Investors</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Abathwa Capital is the premier platform for discovering investment opportunities 
            and building meaningful partnerships that drive innovation forward.
          </p>
          <div className="space-x-4">
            <Link 
              to="/signup" 
              className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Get Started <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Growth Opportunities</h3>
              <p className="text-slate-300">Discover high-potential investment opportunities across diverse industries.</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Trusted Network</h3>
              <p className="text-slate-300">Connect with verified entrepreneurs and accredited investors.</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Investments</h3>
              <p className="text-slate-300">Make informed decisions with comprehensive due diligence data.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 px-6 py-8">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <div className="space-x-6 mb-4">
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p>&copy; 2024 Abathwa Capital. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
