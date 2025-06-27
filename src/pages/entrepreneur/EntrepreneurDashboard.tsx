import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout';
import { 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Building2,
  Lightbulb,
  Shield,
  ArrowLeft
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
  updated_at: string;
  team_data_jsonb?: any;
  location_data_jsonb?: any;
  profitability_data_jsonb?: any;
}

interface DashboardStats {
  totalOpportunities: number;
  publishedOpportunities: number;
  totalFundingSought: number;
  averageRoi: number;
  activeInvestors: number;
  completedMilestones: number;
}

export default function EntrepreneurDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { formatCurrency } = useCurrency();
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOpportunities: 0,
    publishedOpportunities: 0,
    totalFundingSought: 0,
    averageRoi: 0,
    activeInvestors: 0,
    completedMilestones: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load opportunities
      const { data: opportunitiesData, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('entrepreneur_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOpportunities(opportunitiesData || []);

      // Calculate stats
      const totalOpportunities = opportunitiesData?.length || 0;
      const publishedOpportunities = opportunitiesData?.filter(o => o.status === 'published').length || 0;
      const totalFundingSought = opportunitiesData?.reduce((sum, o) => sum + (o.amount_sought || 0), 0) || 0;
      const averageRoi = opportunitiesData?.length > 0 
        ? opportunitiesData.reduce((sum, o) => sum + (o.expected_roi || 0), 0) / opportunitiesData.length 
        : 0;

      // Load additional stats
      const { data: offersData } = await supabase
        .from('offers')
        .select('investor_id')
        .in('opportunity_id', opportunitiesData?.map(o => o.id) || [])
        .eq('status', 'accepted');

      const activeInvestors = new Set(offersData?.map(o => o.investor_id) || []).size;

      // Calculate completed milestones
      let completedMilestones = 0;
      for (const opportunity of opportunitiesData || []) {
        const teamData = opportunity.team_data_jsonb as any;
        const milestones = teamData?.milestones || [];
        completedMilestones += milestones.filter((m: any) => m.status === 'completed').length;
      }

      setStats({
        totalOpportunities,
        publishedOpportunities,
        totalFundingSought,
        averageRoi,
        activeInvestors,
        completedMilestones
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
      draft: { variant: 'secondary' as const, label: 'Draft' },
      pending_review: { variant: 'default' as const, label: 'Under Review' },
      published: { variant: 'default' as const, label: 'Published' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
      funded: { variant: 'default' as const, label: 'Funded' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRiskLevel = (opportunity: Opportunity) => {
    const riskAssessment = opportunity.team_data_jsonb as any;
    if (!riskAssessment?.risk_assessment) return { level: 'Unknown', color: 'secondary' as const };
    
    const risk = riskAssessment.risk_assessment.overallRisk;
    if (risk > 70) return { level: 'High', color: 'destructive' as const };
    if (risk > 40) return { level: 'Medium', color: 'default' as const };
    return { level: 'Low', color: 'secondary' as const };
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);

      if (error) throw error;

      setOpportunities(prev => prev.filter(o => o.id !== opportunityId));
      toast({
        title: "Success",
        description: "Opportunity deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to delete opportunity.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Entrepreneur Dashboard</h1>
              <p className="text-muted-foreground">Manage your investment opportunities and track performance</p>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/entrepreneur/opportunities/new')}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Opportunity</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publishedOpportunities} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funding Sought</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalFundingSought)}
              </div>
              <p className="text-xs text-muted-foreground">
                Average ROI: {stats.averageRoi.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeInvestors}</div>
              <p className="text-xs text-muted-foreground">
                Engaged with your opportunities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Milestones Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedMilestones}</div>
              <p className="text-xs text-muted-foreground">
                Across all opportunities
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
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
                  {opportunities.slice(0, 5).map((opportunity) => (
                    <div key={opportunity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <p className="font-medium">{opportunity.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(opportunity.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(opportunity.status)}
                    </div>
                  ))}
                  
                  {opportunities.length === 0 && (
                    <div className="text-center py-8">
                      <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No opportunities yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => navigate('/entrepreneur/create-opportunity')}
                      >
                        Create your first opportunity
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Publication Rate</span>
                      <span>{stats.totalOpportunities > 0 ? Math.round((stats.publishedOpportunities / stats.totalOpportunities) * 100) : 0}%</span>
                    </div>
                    <Progress value={stats.totalOpportunities > 0 ? (stats.publishedOpportunities / stats.totalOpportunities) * 100 : 0} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average ROI</span>
                      <span>{stats.averageRoi.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(stats.averageRoi, 100)} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Investor Engagement</span>
                      <span>{stats.activeInvestors} investors</span>
                    </div>
                    <Progress value={Math.min(stats.activeInvestors * 20, 100)} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Your Opportunities</span>
                </CardTitle>
                <CardDescription>
                  Manage and track all your investment opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {opportunities.length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.map((opportunity) => {
                      const riskLevel = getRiskLevel(opportunity);
                      return (
                        <div key={opportunity.id} className="border rounded-lg p-6 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold">{opportunity.name}</h3>
                                {getStatusBadge(opportunity.status)}
                                <Badge variant={riskLevel.color}>{riskLevel.level} Risk</Badge>
                              </div>
                              <p className="text-muted-foreground">{opportunity.description}</p>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="flex items-center space-x-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>{formatCurrency(opportunity.amount_sought)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>{opportunity.expected_roi}% ROI</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(opportunity.created_at).toLocaleDateString()}</span>
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/entrepreneur/edit-opportunity/${opportunity.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteOpportunity(opportunity.id)}
                                className="text-destructive ml-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Milestones Progress */}
                          {opportunity.team_data_jsonb?.milestones && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Milestones Progress</span>
                                <span>
                                  {opportunity.team_data_jsonb.milestones.filter((m: any) => m.status === 'completed').length} / {opportunity.team_data_jsonb.milestones.length}
                                </span>
                              </div>
                              <Progress 
                                value={
                                  opportunity.team_data_jsonb.milestones.length > 0 
                                    ? (opportunity.team_data_jsonb.milestones.filter((m: any) => m.status === 'completed').length / opportunity.team_data_jsonb.milestones.length) * 100 
                                    : 0
                                } 
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No opportunities yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first investment opportunity to get started
                    </p>
                    <Button onClick={() => navigate('/entrepreneur/create-opportunity')}>
                      Create Opportunity
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
                    <span>Opportunity Status Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['draft', 'pending_review', 'published', 'rejected', 'funded'].map((status) => {
                      const count = opportunities.filter(o => o.status === status).length;
                      const percentage = opportunities.length > 0 ? (count / opportunities.length) * 100 : 0;
                      
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{count}</span>
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
                    <span>Funding Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Funding Sought</span>
                      <span className="font-medium">{formatCurrency(stats.totalFundingSought)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Opportunity Size</span>
                      <span className="font-medium">
                        {opportunities.length > 0 ? formatCurrency(stats.totalFundingSought / opportunities.length) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average ROI</span>
                      <span className="font-medium">{stats.averageRoi.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>AI Risk Insights</span>
                </CardTitle>
                <CardDescription>
                  AI-powered analysis of your opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {opportunities.length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.map((opportunity) => {
                      const riskAssessment = opportunity.team_data_jsonb as any;
                      if (!riskAssessment?.risk_assessment) return null;

                      return (
                        <div key={opportunity.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{opportunity.name}</h4>
                            <Badge variant={riskAssessment.risk_assessment.overallRisk > 70 ? 'destructive' : riskAssessment.risk_assessment.overallRisk > 40 ? 'default' : 'secondary'}>
                              {riskAssessment.risk_assessment.overallRisk}% Risk
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Financial Risk</p>
                              <p className="font-medium">{riskAssessment.risk_assessment.financialRisk}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Operational Risk</p>
                              <p className="font-medium">{riskAssessment.risk_assessment.operationalRisk}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Market Risk</p>
                              <p className="font-medium">{riskAssessment.risk_assessment.marketRisk}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Compliance Risk</p>
                              <p className="font-medium">{riskAssessment.risk_assessment.complianceRisk}%</p>
                            </div>
                          </div>

                          {riskAssessment.risk_assessment.recommendations && riskAssessment.risk_assessment.recommendations.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Recommendations:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {riskAssessment.risk_assessment.recommendations.slice(0, 3).map((rec: string, index: number) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No AI insights available yet</p>
                    <p className="text-sm text-muted-foreground">Create opportunities to get AI-powered risk analysis</p>
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
