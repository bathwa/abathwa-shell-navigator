import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Target,
  PieChart,
  BarChart3,
  Eye
} from 'lucide-react';

interface Investment {
  id: string;
  opportunity_id: string;
  opportunity_name: string;
  amount_invested: number;
  expected_roi: number;
  current_value: number;
  status: 'active' | 'completed' | 'pending';
  invested_date: string;
  maturity_date: string;
}

interface PortfolioStats {
  totalInvested: number;
  totalValue: number;
  totalReturn: number;
  returnPercentage: number;
  activeInvestments: number;
  completedInvestments: number;
}

export default function Portfolio() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalInvested: 0,
    totalValue: 0,
    totalReturn: 0,
    returnPercentage: 0,
    activeInvestments: 0,
    completedInvestments: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockInvestments: Investment[] = [
        {
          id: '1',
          opportunity_id: 'opp1',
          opportunity_name: 'Tech Startup Alpha',
          amount_invested: 50000,
          expected_roi: 15,
          current_value: 57500,
          status: 'active',
          invested_date: '2024-01-15',
          maturity_date: '2025-01-15'
        },
        {
          id: '2',
          opportunity_id: 'opp2',
          opportunity_name: 'Green Energy Project',
          amount_invested: 75000,
          expected_roi: 12,
          current_value: 84000,
          status: 'active',
          invested_date: '2024-02-20',
          maturity_date: '2025-02-20'
        },
        {
          id: '3',
          opportunity_id: 'opp3',
          opportunity_name: 'Real Estate Development',
          amount_invested: 100000,
          expected_roi: 18,
          current_value: 118000,
          status: 'completed',
          invested_date: '2023-06-10',
          maturity_date: '2024-06-10'
        }
      ];

      setInvestments(mockInvestments);

      // Calculate stats
      const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.amount_invested, 0);
      const totalValue = mockInvestments.reduce((sum, inv) => sum + inv.current_value, 0);
      const totalReturn = totalValue - totalInvested;
      const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
      const activeInvestments = mockInvestments.filter(inv => inv.status === 'active').length;
      const completedInvestments = mockInvestments.filter(inv => inv.status === 'completed').length;

      setStats({
        totalInvested,
        totalValue,
        totalReturn,
        returnPercentage,
        activeInvestments,
        completedInvestments
      });
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading portfolio...</div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Investment Portfolio</h1>
          <p className="text-muted-foreground">Track your investments and returns</p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</div>
              <p className="text-xs text-muted-foreground">
                Across {investments.length} investments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.returnPercentage >= 0 ? '+' : ''}{stats.returnPercentage.toFixed(2)}% return
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.totalReturn >= 0 ? '+' : ''}{formatCurrency(stats.totalReturn)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.returnPercentage >= 0 ? '+' : ''}{stats.returnPercentage.toFixed(2)}% ROI
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeInvestments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedInvestments} completed
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Investments</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Investments</CardTitle>
                <CardDescription>Overview of all your investment positions</CardDescription>
              </CardHeader>
              <CardContent>
                {investments.length > 0 ? (
                  <div className="space-y-4">
                    {investments.map((investment) => {
                      const returnAmount = investment.current_value - investment.amount_invested;
                      const returnPercentage = (returnAmount / investment.amount_invested) * 100;
                      
                      return (
                        <div key={investment.id} className="border rounded-lg p-6 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold">{investment.opportunity_name}</h3>
                                {getStatusBadge(investment.status)}
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="flex items-center space-x-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>Invested: {formatCurrency(investment.amount_invested)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>Current: {formatCurrency(investment.current_value)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Matures: {new Date(investment.maturity_date).toLocaleDateString()}</span>
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

                          {/* Return Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Return</span>
                              <span className={`font-medium ${returnAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {returnAmount >= 0 ? '+' : ''}{formatCurrency(returnAmount)} ({returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%)
                              </span>
                            </div>
                            <Progress 
                              value={Math.min(Math.abs(returnPercentage), 100)} 
                              className={returnPercentage >= 0 ? 'bg-green-100' : 'bg-red-100'}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No investments yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start investing in opportunities to build your portfolio
                    </p>
                    <Button onClick={() => navigate('/investor/dashboard')}>
                      Browse Opportunities
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Investments</CardTitle>
                <CardDescription>Currently active investment positions</CardDescription>
              </CardHeader>
              <CardContent>
                {investments.filter(inv => inv.status === 'active').length > 0 ? (
                  <div className="space-y-4">
                    {investments.filter(inv => inv.status === 'active').map((investment) => {
                      const returnAmount = investment.current_value - investment.amount_invested;
                      const returnPercentage = (returnAmount / investment.amount_invested) * 100;
                      
                      return (
                        <div key={investment.id} className="border rounded-lg p-6 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold">{investment.opportunity_name}</h3>
                                {getStatusBadge(investment.status)}
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="flex items-center space-x-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>Invested: {formatCurrency(investment.amount_invested)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>Current: {formatCurrency(investment.current_value)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Matures: {new Date(investment.maturity_date).toLocaleDateString()}</span>
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

                          {/* Return Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Return</span>
                              <span className={`font-medium ${returnAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {returnAmount >= 0 ? '+' : ''}{formatCurrency(returnAmount)} ({returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%)
                              </span>
                            </div>
                            <Progress 
                              value={Math.min(Math.abs(returnPercentage), 100)} 
                              className={returnPercentage >= 0 ? 'bg-green-100' : 'bg-red-100'}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No active investments</h3>
                    <p className="text-muted-foreground mb-4">
                      Start investing to see your active positions here
                    </p>
                    <Button onClick={() => navigate('/investor/dashboard')}>
                      Browse Opportunities
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Completed Investments</CardTitle>
                <CardDescription>Successfully completed investment positions</CardDescription>
              </CardHeader>
              <CardContent>
                {investments.filter(inv => inv.status === 'completed').length > 0 ? (
                  <div className="space-y-4">
                    {investments.filter(inv => inv.status === 'completed').map((investment) => {
                      const returnAmount = investment.current_value - investment.amount_invested;
                      const returnPercentage = (returnAmount / investment.amount_invested) * 100;
                      
                      return (
                        <div key={investment.id} className="border rounded-lg p-6 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold">{investment.opportunity_name}</h3>
                                {getStatusBadge(investment.status)}
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="flex items-center space-x-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>Invested: {formatCurrency(investment.amount_invested)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>Final Value: {formatCurrency(investment.current_value)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Completed: {new Date(investment.maturity_date).toLocaleDateString()}</span>
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

                          {/* Final Return */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Final Return</span>
                              <span className={`font-medium ${returnAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {returnAmount >= 0 ? '+' : ''}{formatCurrency(returnAmount)} ({returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%)
                              </span>
                            </div>
                            <Progress 
                              value={Math.min(Math.abs(returnPercentage), 100)} 
                              className={returnPercentage >= 0 ? 'bg-green-100' : 'bg-red-100'}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No completed investments</h3>
                    <p className="text-muted-foreground mb-4">
                      Your completed investments will appear here
                    </p>
                    <Button onClick={() => navigate('/investor/dashboard')}>
                      Browse Opportunities
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
} 