import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { useCurrency } from '@/contexts/CurrencyContext';
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target, 
  Calendar, 
  MessageSquare, 
  Eye,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Brain,
  FileText,
  Building,
  Heart,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OpportunityDetail = () => {
  const { id } = useParams()
  const { formatCurrency } = useCurrency()

  // Mock data - in real app this would be fetched based on ID
  const opportunity = {
    id: id,
    name: "EcoTech Solutions",
    description: "EcoTech Solutions is revolutionizing environmental monitoring through cutting-edge IoT sensors and AI-powered analytics. Our platform provides real-time insights for businesses to reduce their environmental impact while optimizing operational efficiency.",
    fullDescription: "Our comprehensive solution includes wireless sensor networks, cloud-based data processing, and intuitive dashboards that help organizations track air quality, water usage, energy consumption, and waste generation. With proven ROI in multiple pilot programs, we're ready to scale globally.",
    amount: 250000, // Changed to number for currency formatting
    roi: "25%",
    industry: "Technology",
    timeline: "6-12 months",
    entrepreneur: {
      name: "John Smith",
      title: "CEO & Founder",
      experience: "10+ years in environmental technology"
    },
    metrics: {
      customers: "15 pilot customers",
      revenue: "$50K ARR",
      growth: "150% YoY"
    },
    riskFactors: [
      "Market competition from established players",
      "Regulatory changes in environmental standards",
      "Scalability challenges in hardware manufacturing"
    ],
    useOfFunds: [
      { category: "Product Development", percentage: 40, amount: 100000 },
      { category: "Marketing & Sales", percentage: 35, amount: 87500 },
      { category: "Operations", percentage: 25, amount: 62500 }
    ]
  }

  const handleExpressInterest = () => {
    console.log('Expressing interest in opportunity:', id)
    // In real app, this would call Supabase
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-slate-800 rounded-lg p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-white">{opportunity.name}</h1>
                <p className="text-xl text-slate-300 mt-2">{opportunity.description}</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="text-emerald-500" size={20} />
                  <span className="text-white font-semibold">{formatCurrency(opportunity.amount)}</span>
                  <span className="text-slate-400">sought</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="text-emerald-500" size={20} />
                  <span className="text-white font-semibold">{opportunity.roi}</span>
                  <span className="text-slate-400">expected ROI</span>
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
            <button
              onClick={handleExpressInterest}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
            >
              <Heart className="mr-2" size={20} />
              Express Interest
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Detailed Description */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">About This Opportunity</h2>
              <p className="text-slate-300 leading-relaxed">{opportunity.fullDescription}</p>
            </div>

            {/* Key Metrics */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Key Metrics</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Current Customers</p>
                  <p className="text-white font-semibold">{opportunity.metrics.customers}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Annual Revenue</p>
                  <p className="text-white font-semibold">{opportunity.metrics.revenue}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Growth Rate</p>
                  <p className="text-white font-semibold">{opportunity.metrics.growth}</p>
                </div>
              </div>
            </div>

            {/* Use of Funds */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Use of Funds</h2>
              <div className="space-y-4">
                {opportunity.useOfFunds.map((fund, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                      <span className="text-white">{fund.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-semibold">{formatCurrency(fund.amount)}</span>
                      <span className="text-slate-400 ml-2">({fund.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Risk Factors</h2>
              <ul className="space-y-2">
                {opportunity.riskFactors.map((risk, index) => (
                  <li key={index} className="text-slate-300 flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Entrepreneur Info */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Entrepreneur</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                    <User className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{opportunity.entrepreneur.name}</p>
                    <p className="text-slate-400 text-sm">{opportunity.entrepreneur.title}</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm">{opportunity.entrepreneur.experience}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleExpressInterest}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                >
                  Express Interest
                </button>
                <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
                  Download Pitch Deck
                </button>
                <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

export default OpportunityDetail
