
import { CheckCircle, XCircle, DollarSign, TrendingUp, Building, Calendar, User, FileText } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout'

const OpportunityReview = () => {
  const { id } = useParams()

  // Mock data - in real app this would be fetched based on ID
  const opportunity = {
    id: id,
    name: "Green Energy Solutions",
    description: "Revolutionary solar panel technology with 40% higher efficiency than current market standards. Our patented nano-coating technology allows for maximum energy absorption while maintaining durability in harsh weather conditions.",
    amount: "$300,000",
    roi: "30%",
    industry: "Energy",
    timeline: "8-12 months",
    submitted: "2024-01-20",
    entrepreneur: {
      name: "Alice Johnson",
      email: "alice@greenenergy.com",
      title: "CEO & Founder",
      experience: "15+ years in renewable energy",
      previousCompanies: ["SolarTech Corp", "EcoEnergy Solutions"]
    },
    businessPlan: {
      marketSize: "$50B global solar market",
      targetMarket: "Commercial and residential solar installations",
      competition: "SunPower, Tesla Solar, Canadian Solar",
      uniqueValue: "40% higher efficiency with 25% lower cost"
    },
    financials: {
      currentRevenue: "$125K ARR",
      projectedRevenue: "$2M in Year 2",
      customers: "8 pilot customers",
      team: "12 employees"
    },
    documents: [
      "Business Plan.pdf",
      "Financial Projections.xlsx",
      "Patent Documentation.pdf",
      "Market Research.pdf"
    ]
  }

  const handleApprove = () => {
    console.log('Approving opportunity:', id)
    // In real app, this would update Supabase
  }

  const handleReject = () => {
    console.log('Rejecting opportunity:', id)
    // In real app, this would update Supabase
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-slate-800 rounded-lg p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-white">{opportunity.name}</h1>
                <p className="text-slate-400">Submitted: {opportunity.submitted}</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="text-emerald-500" size={20} />
                  <span className="text-white font-semibold">{opportunity.amount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="text-emerald-500" size={20} />
                  <span className="text-white font-semibold">{opportunity.roi}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="text-emerald-500" size={20} />
                  <span className="text-slate-400">{opportunity.industry}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="text-emerald-500" size={20} />
                  <span className="text-slate-400">{opportunity.timeline}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
              >
                <XCircle className="mr-2" size={20} />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
              >
                <CheckCircle className="mr-2" size={20} />
                Approve
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Opportunity Description */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FileText className="mr-2" size={20} />
                Opportunity Description
              </h2>
              <p className="text-slate-300 leading-relaxed">{opportunity.description}</p>
            </div>

            {/* Business Plan */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Business Plan Overview</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-emerald-500 font-semibold mb-2">Market Size</h3>
                  <p className="text-slate-300">{opportunity.businessPlan.marketSize}</p>
                </div>
                <div>
                  <h3 className="text-emerald-500 font-semibold mb-2">Target Market</h3>
                  <p className="text-slate-300">{opportunity.businessPlan.targetMarket}</p>
                </div>
                <div>
                  <h3 className="text-emerald-500 font-semibold mb-2">Competition</h3>
                  <p className="text-slate-300">{opportunity.businessPlan.competition}</p>
                </div>
                <div>
                  <h3 className="text-emerald-500 font-semibold mb-2">Unique Value</h3>
                  <p className="text-slate-300">{opportunity.businessPlan.uniqueValue}</p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Financial Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-emerald-500 font-semibold mb-2">Current Revenue</h3>
                  <p className="text-slate-300">{opportunity.financials.currentRevenue}</p>
                </div>
                <div>
                  <h3 className="text-emerald-500 font-semibold mb-2">Projected Revenue</h3>
                  <p className="text-slate-300">{opportunity.financials.projectedRevenue}</p>
                </div>
                <div>
                  <h3 className="text-emerald-500 font-semibold mb-2">Current Customers</h3>
                  <p className="text-slate-300">{opportunity.financials.customers}</p>
                </div>
                <div>
                  <h3 className="text-emerald-500 font-semibold mb-2">Team Size</h3>
                  <p className="text-slate-300">{opportunity.financials.team}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Supporting Documents</h2>
              <div className="space-y-3">
                {opportunity.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                    <span className="text-white">{doc}</span>
                    <button className="text-emerald-500 hover:text-emerald-400 text-sm font-semibold">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Entrepreneur Info */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="mr-2" size={20} />
                Entrepreneur
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-white font-semibold">{opportunity.entrepreneur.name}</p>
                  <p className="text-slate-400 text-sm">{opportunity.entrepreneur.title}</p>
                  <p className="text-slate-400 text-sm">{opportunity.entrepreneur.email}</p>
                </div>
                <div>
                  <h4 className="text-emerald-500 font-semibold mb-1">Experience</h4>
                  <p className="text-slate-300 text-sm">{opportunity.entrepreneur.experience}</p>
                </div>
                <div>
                  <h4 className="text-emerald-500 font-semibold mb-1">Previous Companies</h4>
                  {opportunity.entrepreneur.previousCompanies.map((company, index) => (
                    <p key={index} className="text-slate-300 text-sm">• {company}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Review Checklist */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Review Checklist</h3>
              <div className="space-y-3">
                {[
                  "Business plan completeness",
                  "Financial projections accuracy",
                  "Market opportunity validation",
                  "Team credentials verification",
                  "Legal documentation review",
                  "Due diligence completed"
                ].map((item, index) => (
                  <label key={index} className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Admin Notes</h3>
              <textarea
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 p-3"
                placeholder="Add your review notes here..."
              />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

export default OpportunityReview
