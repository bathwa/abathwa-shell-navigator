
import { Plus, TrendingUp, Eye, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout'

const EntrepreneurDashboard = () => {
  const mockOpportunities = [
    { id: 1, name: "EcoTech Solutions", amount: "$250K", status: "Under Review", views: 23 },
    { id: 2, name: "AI Health Platform", amount: "$500K", status: "Approved", views: 45 },
    { id: 3, name: "Sustainable Packaging", amount: "$150K", status: "Draft", views: 0 },
  ]

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Entrepreneur Dashboard</h1>
          <Link 
            to="/entrepreneur/opportunities/new"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
          >
            <Plus className="mr-2" size={20} />
            Create New Opportunity
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Opportunities</p>
                <p className="text-2xl font-bold text-white">{mockOpportunities.length}</p>
              </div>
              <TrendingUp className="text-emerald-500" size={32} />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Views</p>
                <p className="text-2xl font-bold text-white">
                  {mockOpportunities.reduce((sum, opp) => sum + opp.views, 0)}
                </p>
              </div>
              <Eye className="text-emerald-500" size={32} />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending Review</p>
                <p className="text-2xl font-bold text-white">
                  {mockOpportunities.filter(opp => opp.status === "Under Review").length}
                </p>
              </div>
              <Clock className="text-emerald-500" size={32} />
            </div>
          </div>
        </div>

        {/* My Opportunities */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">My Opportunities</h2>
          <div className="space-y-4">
            {mockOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{opportunity.name}</h3>
                  <p className="text-slate-400">Seeking: {opportunity.amount}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    opportunity.status === 'Approved' ? 'bg-emerald-600 text-white' :
                    opportunity.status === 'Under Review' ? 'bg-yellow-600 text-white' :
                    'bg-slate-600 text-slate-300'
                  }`}>
                    {opportunity.status}
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{opportunity.views} views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

export default EntrepreneurDashboard
