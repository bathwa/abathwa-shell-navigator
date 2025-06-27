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
  Shield, 
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
  Settings,
  UserCheck,
  UserX,
  CreditCard,
  AlertCircle,
  Zap,
  Database,
  Cpu,
  Network
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { drbeService } from '@/services/drbeService';
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
    email?: string;
  };
}

interface User {
  id: string;
  full_name: string;
  email?: string;
  role: 'super_admin' | 'admin' | 'entrepreneur' | 'investor';
  created_at: string;
  avatar_url?: string;
}

interface Payment {
  id: string;
  amount: number;
  status: 'initiated' | 'pending_proof' | 'admin_review' | 'onward_transfer_pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_type: 'investment' | 'service_fee' | 'milestone_payout' | 'admin_transfer' | 'refund';
  created_at: string;
  sender?: User;
  receiver?: User;
}

interface SystemStats {
  totalUsers: number;
  totalOpportunities: number;
  totalPayments: number;
  pendingReviews: number;
  systemHealth: number;
  activeSessions: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { formatCurrency } = useCurrency();
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalOpportunities: 0,
    totalPayments: 0,
    pendingReviews: 0,
    systemHealth: 100,
    activeSessions: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load opportunities with error handling
      let opportunitiesData = [];
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select(`
            *,
            entrepreneur:profiles!opportunities_entrepreneur_id_fkey(full_name, avatar_url, email)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading opportunities:', error);
          toast({
            title: "Warning",
            description: "Failed to load opportunities data.",
            variant: "destructive",
          });
        } else {
          opportunitiesData = data || [];
        }
      } catch (error) {
        console.error('Exception loading opportunities:', error);
      }

      setOpportunities(opportunitiesData);

      // Load users with error handling
      let usersData = [];
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading users:', error);
          toast({
            title: "Warning",
            description: "Failed to load users data.",
            variant: "destructive",
          });
        } else {
          usersData = data || [];
        }
      } catch (error) {
        console.error('Exception loading users:', error);
      }

      setUsers(usersData);

      // Load payments with error handling
      let paymentsData = [];
      try {
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            sender:profiles!payments_sender_id_fkey(full_name, avatar_url),
            receiver:profiles!payments_receiver_id_fkey(full_name, avatar_url)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading payments:', error);
          toast({
            title: "Warning",
            description: "Failed to load payments data.",
            variant: "destructive",
          });
        } else {
          paymentsData = data || [];
        }
      } catch (error) {
        console.error('Exception loading payments:', error);
      }

      setPayments(paymentsData);

      // Calculate system stats
      const totalUsers = usersData.length;
      const totalOpportunities = opportunitiesData.length;
      const totalPayments = paymentsData.length;
      const pendingReviews = opportunitiesData.filter(o => o.status === 'pending_review').length;
      const totalRevenue = paymentsData.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      setSystemStats({
        totalUsers,
        totalOpportunities,
        totalPayments,
        pendingReviews,
        systemHealth: 98, // Mock data
        activeSessions: 45, // Mock data
        totalRevenue,
        monthlyGrowth: 12.5 // Mock data
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please refresh the page.",
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

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      initiated: { variant: 'secondary' as const, label: 'Initiated' },
      pending_proof: { variant: 'default' as const, label: 'Pending Proof' },
      admin_review: { variant: 'default' as const, label: 'Admin Review' },
      onward_transfer_pending: { variant: 'default' as const, label: 'Transfer Pending' },
      completed: { variant: 'default' as const, label: 'Completed' },
      failed: { variant: 'destructive' as const, label: 'Failed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.initiated;
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

  const handleApproveOpportunity = async (opportunityId: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ status: 'published' })
        .eq('id', opportunityId);

      if (error) throw error;

      setOpportunities(prev => prev.map(o => 
        o.id === opportunityId ? { ...o, status: 'published' } : o
      ));

      toast({
        title: "Opportunity approved",
        description: "The opportunity has been published successfully.",
      });
    } catch (error) {
      console.error('Error approving opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to approve opportunity.",
        variant: "destructive",
      });
    }
  };

  const handleRejectOpportunity = async (opportunityId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ 
          status: 'rejected',
          team_data_jsonb: { rejection_reason: reason }
        })
        .eq('id', opportunityId);

      if (error) throw error;

      setOpportunities(prev => prev.map(o => 
        o.id === opportunityId ? { ...o, status: 'rejected' } : o
      ));

      toast({
        title: "Opportunity rejected",
        description: "The opportunity has been rejected.",
      });
    } catch (error) {
      console.error('Error rejecting opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to reject opportunity.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'admin_review',
          admin_confirm_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      setPayments(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: 'admin_review' } : p
      ));

      toast({
        title: "Payment verified",
        description: "The payment has been verified and is ready for processing.",
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Error",
        description: "Failed to verify payment.",
        variant: "destructive",
      });
    }
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.entrepreneur?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || opportunity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" data-testid="loading-spinner"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center" data-testid="error-message">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">System administration and oversight</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Button variant="outline" onClick={() => navigate('/admin/opportunities/review-list')} className="w-full sm:w-auto">
              <Eye className="h-4 w-4 mr-2" />
              Review Opportunities
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/users')} className="w-full sm:w-auto">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="total-users">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.activeSessions} active sessions
              </p>
            </CardContent>
          </Card>

          <Card data-testid="total-opportunities">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalOpportunities}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.pendingReviews} pending review
              </p>
            </CardContent>
          </Card>

          <Card data-testid="total-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(systemStats.totalRevenue)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowRight className="h-3 w-3 mr-1" />
                +{systemStats.monthlyGrowth}% this month
              </div>
            </CardContent>
          </Card>

          <Card data-testid="system-health">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.systemHealth}%</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="overview-tab">Overview</TabsTrigger>
            <TabsTrigger value="opportunities" data-testid="opportunities-tab">Opportunities</TabsTrigger>
            <TabsTrigger value="users" data-testid="users-tab">Users</TabsTrigger>
            <TabsTrigger value="payments" data-testid="payments-tab">Payments</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="analytics-tab">Analytics</TabsTrigger>
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
                            {opportunity.entrepreneur?.full_name} • {new Date(opportunity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(opportunity.status)}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* System Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>System Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemStats.pendingReviews > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {systemStats.pendingReviews} opportunities pending review
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      All systems operational - {systemStats.systemHealth}% uptime
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      AI/ML services running optimally
                    </AlertDescription>
                  </Alert>
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
                  <FileText className="h-5 w-5" />
                  <span>Manage Opportunities</span>
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="funded">Funded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Opportunities List */}
            <div className="space-y-4">
              {filteredOpportunities.map((opportunity) => {
                const riskLevel = getRiskLevel(opportunity);
                return (
                  <Card key={opportunity.id}>
                    <CardContent className="p-6">
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
                              <Users className="h-4 w-4" />
                              <span>{opportunity.entrepreneur?.full_name}</span>
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
                          {opportunity.status === 'pending_review' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveOpportunity(opportunity.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRejectOpportunity(opportunity.id, 'Does not meet criteria')}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Management</span>
                </CardTitle>
                <CardDescription>
                  Manage platform users and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.full_name?.charAt(0) || user.email?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Management</span>
                </CardTitle>
                <CardDescription>
                  Monitor and verify payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{formatCurrency(payment.amount)}</h4>
                          {getPaymentStatusBadge(payment.status)}
                          <Badge variant="outline">{payment.payment_type}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>From: {payment.sender?.full_name}</span>
                          <span>To: {payment.receiver?.full_name}</span>
                          <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {payment.status === 'pending_proof' && (
                          <Button
                            size="sm"
                            onClick={() => handleVerifyPayment(payment.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                    <span>User Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['entrepreneur', 'investor', 'admin', 'super_admin'].map((role) => {
                      const count = users.filter(u => u.role === role).length;
                      const percentage = users.length > 0 ? (count / users.length) * 100 : 0;
                      
                      return (
                        <div key={role} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-sm capitalize">{role.replace('_', ' ')}</span>
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
                    <BarChart3 className="h-5 w-5" />
                    <span>System Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">System Uptime</span>
                      <span className="font-medium">{systemStats.systemHealth}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Active Sessions</span>
                      <span className="font-medium">{systemStats.activeSessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Transactions</span>
                      <span className="font-medium">{systemStats.totalPayments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Growth</span>
                      <span className="font-medium text-green-600">+{systemStats.monthlyGrowth}%</span>
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
