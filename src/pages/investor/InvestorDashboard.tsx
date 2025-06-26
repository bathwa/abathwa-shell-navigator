
import { TrendingUp, Eye, Heart, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout'

const InvestorDashboard = () => {
  const mockOpportunities = [
    { 
      id: 1, 
      name: "EcoTech Solutions", 
      description: "Sustainable technology for environmental monitoring",
      amount: "$250K", 
      roi: "25%",
      industry: "Technology",
      entrepreneur: "John Smith"
    },
    { 
      id: 2, 
      name: "AI Health Platform", 
      description: "AI-powered healthcare diagnostics platform",
      amount: "$500K", 
      roi: "30%",
      industry: "Healthcare",
      entrepreneur: "Sarah Johnson"
    },
    { 
      id: 3, 
      name: "FinTech Revolution", 
      description: "Next-generation digital banking solution",
      amount: "$750K", 
      roi: "35%",
      industry: "Finance",
      entrepreneur: "Mike Chen"
    },
  ]

  const myInterests = [
    { id: 1, name: "EcoTech Solutions", status: "Pending", date: "2024-01-15" },
    { id: 4, name: "Smart Agriculture", status: "Approved", date: "2024-01-10" },
  ]

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Investor Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search opportunities..."
                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Available Opportunities</p>
                <p className="text-2xl font-bold text-white">{mockOpportunities.length}</p>
              </div>
              <TrendingUp className="text-emerald-500" size={32} />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Opportunities Viewed</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <Eye className="text-emerald-500" size={32} />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Interests Expressed</p>
                <p className="text-2xl font-bold text-white">{myInterests.length}</p>
              </div>
              <Heart className="text-emerald-500" size={32} />
            </div>
          </div>
        </div>

        {/* Available Opportunities */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Available Opportunities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockOpportunities.map((opportunity) => (
              <Link
                key={opportunity.id}
                to={`/opportunities/${opportunity.id}`}
                className="bg-slate-700 rounded-lg p-6 hover:bg-slate-600 transition-colors"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{opportunity.name}</h3>
                    <p className="text-slate-400 text-sm">{opportunity.description}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-emerald-500 font-semibold">{opportunity.amount}</p>
                      <p className="text-slate-400 text-sm">Investment Sought</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-500 font-semibold">{opportunity.roi}</p>
                      <p className="text-slate-400 text-sm">Expected ROI</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                    <span className="inline-block px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded">
                      {opportunity.industry}
                    </span>
                    <p className="text-slate-400 text-sm">by {opportunity.entrepreneur}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* My Expressed Interests */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">My Expressed Interests</h2>
          <div className="space-y-4">
            {myInterests.map((interest) => (
              <div key={interest.id} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{interest.name}</h3>
                  <p className="text-slate-400 text-sm">Expressed on {interest.date}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  interest.status === 'Approved' ? 'bg-emerald-600 text-white' :
                  'bg-yellow-600 text-white'
                }`}>
                  {interest.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

export default InvestorDashboard
