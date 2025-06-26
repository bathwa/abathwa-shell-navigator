
import { Users, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout'

const AdminDashboard = () => {
  const pendingOpportunities = [
    { 
      id: 1, 
      name: "Green Energy Solutions", 
      entrepreneur: "Alice Johnson", 
      amount: "$300K",
      submitted: "2024-01-20",
      industry: "Energy"
    },
    { 
      id: 2, 
      name: "EdTech Platform", 
      entrepreneur: "Bob Wilson", 
      amount: "$150K",
      submitted: "2024-01-19",
      industry: "Education"
    },
    { 
      id: 3, 
      name: "Healthcare Analytics", 
      entrepreneur: "Carol Davis", 
      amount: "$450K",
      submitted: "2024-01-18",
      industry: "Healthcare"
    },
  ]

  const stats = {
    totalUsers: 247,
    totalOpportunities: 156,
    pendingReviews: pendingOpportunities.length,
    approvedThisMonth: 12,
    rejectedThisMonth: 3
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <Link 
            to="/admin/users"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
          >
            <Users className="mr-2" size={20} />
            Manage Users
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-6">
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="text-emerald-500" size={32} />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Opportunities</p>
                <p className="text-2xl font-bold text-white">{stats.totalOpportunities}</p>
              </div>
              <TrendingUp className="text-emerald-500" size={32} />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending Reviews</p>
                <p className="text-2xl font-bold text-white">{stats.pendingReviews}</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Approved (This Month)</p>
                <p className="text-2xl font-bold text-white">{stats.approvedThisMonth}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Rejected (This Month)</p>
                <p className="text-2xl font-bold text-white">{stats.rejectedThisMonth}</p>
              </div>
              <XCircle className="text-red-500" size={32} />
            </div>
          </div>
        </div>

        {/* Opportunities for Review */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Opportunities for Review</h2>
          <div className="space-y-4">
            {pendingOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white">{opportunity.name}</h3>
                    <p className="text-slate-400 text-sm">
                      by {opportunity.entrepreneur} • {opportunity.amount} • {opportunity.industry}
                    </p>
                    <p className="text-slate-500 text-xs">Submitted: {opportunity.submitted}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link
                      to={`/admin/opportunities/${opportunity.id}/review`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Review
                    </Link>
                    <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Pending
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Approvals</h2>
            <div className="space-y-3">
              {[
                { name: "AI Startup Solutions", date: "2024-01-22" },
                { name: "Sustainable Packaging", date: "2024-01-21" },
                { name: "FinTech Innovation", date: "2024-01-20" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-white">{item.name}</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <span className="text-slate-400 text-sm">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Registrations</h2>
            <div className="space-y-3">
              {[
                { name: "investor@example.com", type: "Investor", date: "2024-01-22" },
                { name: "entrepreneur@startup.com", type: "Entrepreneur", date: "2024-01-21" },
                { name: "user@company.com", type: "Investor", date: "2024-01-20" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-white">{item.name}</span>
                    <span className="text-emerald-500 text-sm ml-2">({item.type})</span>
                  </div>
                  <span className="text-slate-400 text-sm">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

export default AdminDashboard
