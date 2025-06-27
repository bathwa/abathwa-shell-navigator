
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/useDataStore';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Activity,
  Eye,
  Calendar,
  Building,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface Investment {
  id: string;
  amount: number;
  opportunity: {
    id: string;
    name: string;
    industry: string;
    expected_roi: number;
    status: string;
  };
  created_at: string;
  status: string;
}

interface DashboardStats {
  totalInvested: number;
  activeInvestments: number;
  totalReturns: number;
  portfolioValue: number;
  roi: number;
}

interface RecentOpportunity {
  id: string;
  name: string;
  industry: string;
  amount_sought: number;
  expected_roi: number;
  status: string;
  created_at: string;
  entrepreneur: {
    full_name: string;
  };
}

export default function InvestorDashboard() {
  const { user } = useAuthStore();
  const { opportunities, syncAllData } = useDataStore();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [recentOpportunities, setRecentOpportunities] = useState<RecentOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvested: 0,
    activeInvestments: 0,
    totalReturns: 0,
    portfolioValue: 0,
    roi: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
      syncAllData();
    }
  }, [user, syncAllData]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load investor's offers (investments)
      const { data: offersData, error: offersError } = await supabase
        .from('offers')
        .select(`
          *,
          opportunity:opportunities(
            id,
            name,
            industry,
            expected_roi,
            status
          )
        `)
        .eq('investor_id', user.id)
        .order('created_at', { ascending: false });

      if (offersError) {
        console.error('Error loading investments:', offersError);
      } else {
        const investmentsData = offersData?.map(offer => ({
          id: offer.id,
          amount: offer.amount,
          opportunity: offer.opportunity,
          created_at: offer.created_at,
          status: offer.status
        })) || [];
        
        setInvestments(investmentsData);
        
        // Calculate stats
        const totalInvested = investmentsData.reduce((sum, inv) => sum + inv.amount, 0);
        const activeInvestments = investmentsData.filter(inv => inv.status === 'accepted').length;
        const portfolioValue = totalInvested * 1.15; // Mock portfolio growth
        const totalReturns = portfolioValue - totalInvested;
        const roi = totalInvested > 0 ? ((totalReturns / totalInvested) * 100) : 0;

        setStats({
          totalInvested,
          activeInvestments,
          totalReturns,
          portfolioValue,
          roi
        });
      }

      // Load recent opportunities
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select(`
          *,
          entrepreneur:profiles!opportunities_entrepreneur_id_fkey(
            full_name
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);

      if (opportunitiesError) {
        console.error('Error loading opportunities:', opportunitiesError);
      } else {
        setRecentOpportunities(opportunitiesData || []);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { variant: 'secondary' as const, label: 'Pending' },
      'accepted': { variant: 'default' as const, label: 'Accepted' },
      'rejected': { variant: 'destructive' as const, label: 'Rejected' },
      'published': { variant: 'default' as const, label: 'Published' },
      'draft': { variant: 'secondary' as const, label: 'Draft' },
      'under_review': { variant: 'outline' as const, label: 'Under Review' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Investor Dashboard</h1>
            <p className="text-muted-foreground">Track your investments and discover new opportunities</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button onClick={() => navigate('/opportunities/list')}>
              Browse Opportunities
            </Button>
            <Button variant="outline" onClick={() => navigate('/investor/portfolio')}>
              View Portfolio
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeInvestments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.portfolioValue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {stats.totalReturns >= 0 ? '+' : ''}{formatCurrency(stats.totalReturns)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI</CardTitle>
              {stats.roi >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Investments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Investments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investments.slice(0, 5).map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{investment.opportunity.name}</h4>
                        {getStatusBadge(investment.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatCurrency(investment.amount)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Building className="h-3 w-3" />
                          <span>{investment.opportunity.industry}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(investment.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/opportunities/${investment.opportunity.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {investments.length === 0 && (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No investments yet</p>
                    <Button 
                      className="mt-3" 
                      onClick={() => navigate('/opportunities/list')}
                    >
                      Browse Opportunities
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Latest Investment Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{opportunity.name}</h4>
                        {getStatusBadge(opportunity.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatCurrency(opportunity.amount_sought)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{opportunity.expected_roi}% ROI</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Building className="h-3 w-3" />
                          <span>{opportunity.industry}</span>
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        By {opportunity.entrepreneur.full_name}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
                
                {recentOpportunities.length === 0 && (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No opportunities available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
