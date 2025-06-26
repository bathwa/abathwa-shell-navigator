
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Mail, Lock, CheckCircle } from 'lucide-react'

const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'entrepreneur' | 'investor'>('entrepreneur')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock signup logic - in real app this would call Supabase
    console.log('Sign up:', { email, password, confirmPassword, role })
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-emerald-500">
            Abathwa Capital
          </Link>
          <h2 className="mt-4 text-2xl font-semibold text-white">Create your account</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              I am a...
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="entrepreneur">Entrepreneur seeking investment</option>
              <option value="investor">Investor looking for opportunities</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Create a password"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            <UserPlus className="mr-2" size={20} />
            Create Account
          </button>

          <div className="text-center">
            <span className="text-slate-400">Already have an account? </span>
            <Link to="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignUp
