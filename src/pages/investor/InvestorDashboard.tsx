import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout';
import { 
  Search, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye,
  Heart,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Building2,
  Lightbulb,
  Shield,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Opportunity {
  id: string;
  name: string;
  description: string;
  amount_sought: number;
  expected_roi: number;
  industry: string;
  status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'funded';
  created_at: string;
  entrepreneur_id: string;
  team_data_jsonb?: any;
  location_data_jsonb?: any;
  profitability_data_jsonb?: any;
  entrepreneur?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Investment {
  id: string;
  opportunity_id: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  opportunity?: Opportunity;
}

interface PortfolioStats {
  totalInvested: number;
  totalReturn: number;
  activeInvestments: number;
  averageRoi: number;
  portfolioValue: number;
  monthlyGrowth: number;
}

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { formatCurrency } = useCurrency();
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalInvested: 0,
    totalReturn: 0,
    activeInvestments: 0,
    averageRoi: 0,
    portfolioValue: 0,
    monthlyGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const industries = [
    'all', 'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
    'Real Estate', 'Transportation', 'Energy', 'Agriculture', 'Entertainment'
  ];

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load published opportunities
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select(`
          *,
          entrepreneur:profiles!opportunities_entrepreneur_id_fkey(full_name, avatar_url)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (opportunitiesError) throw opportunitiesError;

      setOpportunities(opportunitiesData || []);

      // Load user's investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('offers')
        .select(`
          *,
          opportunity:opportunities!offers_opportunity_id_fkey(
            *,
            entrepreneur:profiles!opportunities_entrepreneur_id_fkey(full_name, avatar_url)
          )
        `)
        .eq('investor_id', user.id)
        .order('created_at', { ascending: false });

      if (investmentsError) throw investmentsError;

      setInvestments(investmentsData || []);

      // Calculate portfolio stats
      const totalInvested = investmentsData?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
      const activeInvestments = investmentsData?.filter(inv => inv.status === 'accepted').length || 0;
      
      // Calculate returns (simplified - in real app, this would be more complex)
      const totalReturn = investmentsData?.reduce((sum, inv) => {
        if (inv.status === 'accepted' && inv.opportunity) {
          return sum + (inv.amount * (inv.opportunity.expected_roi / 100));
        }
        return sum;
      }, 0) || 0;

      const averageRoi = activeInvestments > 0 
        ? investmentsData?.filter(inv => inv.status === 'accepted')
            .reduce((sum, inv) => sum + (inv.opportunity?.expected_roi || 0), 0) / activeInvestments 
        : 0;

      setPortfolioStats({
        totalInvested,
        totalReturn,
        activeInvestments,
        averageRoi,
        portfolioValue: totalInvested + totalReturn,
        monthlyGrowth: 5.2 // Mock data - would be calculated from historical data
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      accepted: { variant: 'default' as const, label: 'Active' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
      withdrawn: { variant: 'outline' as const, label: 'Withdrawn' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRiskLevel = (opportunity: Opportunity) => {
    const riskAssessment = opportunity.team_data_jsonb?.risk_assessment;
    if (!riskAssessment) return { level: 'Unknown', color: 'secondary' as const };
    
    const risk = riskAssessment.overallRisk;
    if (risk > 70) return { level: 'High', color: 'destructive' as const };
    if (risk > 40) return { level: 'Medium', color: 'default' as const };
    return { level: 'Low', color: 'secondary' as const };
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === 'all' || opportunity.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'roi-high':
        return b.expected_roi - a.expected_roi;
      case 'roi-low':
        return a.expected_roi - b.expected_roi;
      case 'amount-high':
        return b.amount_sought - a.amount_sought;
      case 'amount-low':
        return a.amount_sought - b.amount_sought;
      default:
        return 0;
    }
  });

  const handleInvest = async (opportunityId: string, amount: number) => {
    try {
      const { error } = await supabase
        .from('offers')
        .insert({
          opportunity_id: opportunityId,
          investor_id: user?.id,
          amount: amount,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Investment submitted",
        description: "Your investment offer has been submitted for review.",
      });

      // Reload data
      loadDashboardData();
    } catch (error) {
      console.error('Error submitting investment:', error);
      toast({
        title: "Error",
        description: "Failed to submit investment offer.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" data-testid="loading-spinner"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Investor Dashboard</h1>
            <p className="text-muted-foreground">Discover opportunities and manage your investment portfolio</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button onClick={() => navigate('/opportunities/list')} data-testid="browse-opportunities-btn">
              <Search className="h-4 w-4 mr-2" />
              Browse Opportunities
            </Button>
            <Button variant="outline" onClick={() => navigate('/investor/portfolio')} data-testid="portfolio-btn">
              <Wallet className="h-4 w-4 mr-2" />
              Portfolio
            </Button>
            <Button variant="outline" onClick={() => navigate('/investor/payments')} data-testid="payments-btn">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </Button>
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="portfolio-value">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${formatCurrency(portfolioStats.portfolioValue)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{portfolioStats.monthlyGrowth}% this month
              </div>
            </CardContent>
          </Card>

          <Card data-testid="total-invested">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${formatCurrency(portfolioStats.totalInvested)}</div>
              <p className="text-xs text-muted-foreground">
                Across {portfolioStats.activeInvestments} investments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${formatCurrency(portfolioStats.totalReturn)}</div>
              <p className="text-xs text-muted-foreground">
                Average ROI: {portfolioStats.averageRoi.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioStats.activeInvestments}</div>
              <p className="text-xs text-muted-foreground">
                Generating returns
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="opportunities">Discover</TabsTrigger>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {investments.slice(0, 5).map((investment) => (
                    <div key={investment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <p className="font-medium">${formatCurrency(investment.amount)} investment</p>
                          <p className="text-sm text-muted-foreground">
                            {investment.opportunity?.name} • {new Date(investment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(investment.status)}
                    </div>
                  ))}
                  
                  {investments.length === 0 && (
                    <div className="text-center py-8">
                      <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No investments yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => setCurrentTab('opportunities')}
                      >
                        Discover opportunities
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Portfolio Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Portfolio Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Growth</span>
                      <span className="text-green-600">+{portfolioStats.monthlyGrowth}%</span>
                    </div>
                    <Progress value={portfolioStats.monthlyGrowth} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average ROI</span>
                      <span>{portfolioStats.averageRoi.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(portfolioStats.averageRoi, 100)} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Investment Diversity</span>
                      <span>{portfolioStats.activeInvestments} opportunities</span>
                    </div>
                    <Progress value={Math.min(portfolioStats.activeInvestments * 20, 100)} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Discover Opportunities</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search opportunities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry === 'all' ? 'All Industries' : industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="roi-high">Highest ROI</SelectItem>
                      <SelectItem value="roi-low">Lowest ROI</SelectItem>
                      <SelectItem value="amount-high">Highest Amount</SelectItem>
                      <SelectItem value="amount-low">Lowest Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Opportunities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedOpportunities.map((opportunity) => {
                const riskLevel = getRiskLevel(opportunity);
                return (
                  <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg">{opportunity.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{opportunity.industry}</Badge>
                            <Badge variant={riskLevel.color}>{riskLevel.level} Risk</Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {opportunity.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Amount Sought</p>
                          <p className="font-semibold">${formatCurrency(opportunity.amount_sought)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expected ROI</p>
                          <p className="font-semibold text-green-600">{opportunity.expected_roi}%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>By {opportunity.entrepreneur?.full_name || 'Anonymous'}</span>
                        <span>{new Date(opportunity.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleInvest(opportunity.id, opportunity.amount_sought * 0.1)}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Invest
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {sortedOpportunities.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5" />
                  <span>My Investment Portfolio</span>
                </CardTitle>
                <CardDescription>
                  Track your investments and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {investments.length > 0 ? (
                  <div className="space-y-4">
                    {investments.map((investment) => (
                      <div key={investment.id} className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold">{investment.opportunity?.name}</h3>
                              {getStatusBadge(investment.status)}
                            </div>
                            <p className="text-muted-foreground">{investment.opportunity?.description}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4" />
                                <span>${formatCurrency(investment.amount)}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>{investment.opportunity?.expected_roi}% ROI</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(investment.created_at).toLocaleDateString()}</span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/opportunities/${investment.opportunity_id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Investment Progress */}
                        {investment.status === 'accepted' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Investment Progress</span>
                              <span>Active</span>
                            </div>
                            <Progress value={75} />
                            <p className="text-xs text-muted-foreground">
                              Expected return: ${formatCurrency(investment.amount * (investment.opportunity?.expected_roi || 0) / 100)}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No investments yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your portfolio by investing in opportunities
                    </p>
                    <Button onClick={() => setCurrentTab('opportunities')}>
                      Discover Opportunities
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Investment Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investments.filter(inv => inv.status === 'accepted').map((investment) => {
                      const percentage = portfolioStats.totalInvested > 0 
                        ? (investment.amount / portfolioStats.totalInvested) * 100 
                        : 0;
                      
                      return (
                        <div key={investment.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-sm">{investment.opportunity?.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">${formatCurrency(investment.amount)}</span>
                            <span className="text-sm text-muted-foreground">({percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Portfolio Value</span>
                      <span className="font-medium">${formatCurrency(portfolioStats.portfolioValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Returns</span>
                      <span className="font-medium text-green-600">+${formatCurrency(portfolioStats.totalReturn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average ROI</span>
                      <span className="font-medium">{portfolioStats.averageRoi.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Growth</span>
                      <span className="font-medium text-green-600">+{portfolioStats.monthlyGrowth}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
