
import React, { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/Layout/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/metric-card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import {
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
  FileText,
  User,
  Calendar,
  AlertCircle,
  TrendingUp,
  Plus,
  Eye
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  service_category: string;
  budget?: number;
  deadline?: string;
  status: string;
  entrepreneur_id: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date?: string;
  service_request_id: string;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  payment_type: string;
  created_at: string;
  service_request?: {
    title: string;
  };
}

export default function ServiceProviderDashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeRequests: 0,
    completedTasks: 0,
    totalEarnings: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load service requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('assigned_provider_id', user.id)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error loading service requests:', requestsError);
      } else {
        setServiceRequests(requestsData || []);
      }

      // For now, we'll use mock data for tasks and payments since the schema isn't fully defined
      setTasks([
        {
          id: '1',
          title: 'Complete Market Research Report',
          description: 'Analyze market trends for tech startup',
          status: 'in_progress',
          due_date: '2024-02-15',
          service_request_id: '1',
          created_at: '2024-01-15T00:00:00.000Z'
        },
        {
          id: '2',
          title: 'Design Marketing Strategy',
          description: 'Create comprehensive marketing plan',
          status: 'pending',
          due_date: '2024-02-20',
          service_request_id: '2',
          created_at: '2024-01-20T00:00:00.000Z'
        }
      ]);

      setPayments([
        {
          id: '1',
          amount: 2500,
          status: 'paid',
          payment_type: 'service_payment',
          created_at: '2024-01-10T00:00:00.000Z',
          service_request: { title: 'Business Plan Development' }
        },
        {
          id: '2',
          amount: 1800,
          status: 'pending',
          payment_type: 'service_payment',
          created_at: '2024-01-25T00:00:00.000Z',
          service_request: { title: 'Financial Analysis' }
        }
      ]);

      // Calculate stats
      const activeRequests = (requestsData || []).filter(r => r.status === 'open' || r.status === 'in_progress').length;
      const completedTasks = 15; // Mock data
      const totalEarnings = 12500; // Mock data
      const pendingPayments = 3200; // Mock data

      setStats({
        activeRequests,
        completedTasks,
        totalEarnings,
        pendingPayments
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'open': { variant: 'default' as const, label: 'Open' },
      'in_progress': { variant: 'default' as const, label: 'In Progress' },
      'completed': { variant: 'secondary' as const, label: 'Completed' },
      'pending': { variant: 'outline' as const, label: 'Pending' },
      'paid': { variant: 'default' as const, label: 'Paid' },
      'draft': { variant: 'secondary' as const, label: 'Draft' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-lg">Loading dashboard...</div>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Service Provider Dashboard</h1>
            <p className="text-muted-foreground">Manage your service requests and tasks</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Service Offering
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Active Requests"
            value={stats.activeRequests.toString()}
            icon={Briefcase}
          />
          <MetricCard
            title="Completed Tasks"
            value={stats.completedTasks.toString()}
            icon={CheckCircle}
          />
          <MetricCard
            title="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            icon={DollarSign}
          />
          <MetricCard
            title="Pending Payments"
            value={formatCurrency(stats.pendingPayments)}
            icon={Clock}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Service Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Service Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{request.title}</h4>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Briefcase className="h-3 w-3" />
                          <span>{request.service_category}</span>
                        </span>
                        {request.budget && (
                          <span className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatCurrency(request.budget)}</span>
                          </span>
                        )}
                        {request.deadline && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(request.deadline).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {serviceRequests.length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No service requests assigned</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{task.title}</h4>
                        {getStatusBadge(task.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      {task.due_date && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {tasks.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No tasks assigned</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold">{payment.service_request?.title || 'Service Payment'}</h4>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{formatCurrency(payment.amount)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {payments.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No payments recorded</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
}
