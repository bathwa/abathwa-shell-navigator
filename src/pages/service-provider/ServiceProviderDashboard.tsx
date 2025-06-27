
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  Clock, 
  Star, 
  MessageSquare, 
  Calendar,
  DollarSign,
  FileText,
  User,
  Phone,
  Mail,
  Globe
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  service_category: string;
  budget: number;
  deadline: string;
  status: string;
  created_at: string;
  entrepreneur: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ServiceProvider {
  id: string;
  company_name: string;
  service_category: string;
  description: string;
  rating: number;
  review_count: number;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  is_verified: boolean;
}

interface DashboardStats {
  completedJobs: number;
  activeJobs: number;
  totalEarnings: number;
  averageRating: number;
  reviewCount: number;
}

export default function ServiceProviderDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('active');
  const [stats, setStats] = useState<DashboardStats>({
    completedJobs: 0,
    activeJobs: 0,
    totalEarnings: 0,
    averageRating: 0,
    reviewCount: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load service provider profile
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (providerError && providerError.code !== 'PGRST116') {
        console.error('Error loading provider:', providerError);
      } else if (providerData) {
        setProvider(providerData);

        // Load assigned service requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('service_requests')
          .select(`
            *,
            entrepreneur:profiles!service_requests_entrepreneur_id_fkey(
              full_name,
              avatar_url
            )
          `)
          .eq('assigned_provider_id', providerData.id)
          .order('created_at', { ascending: false });

        if (requestsError) {
          console.error('Error loading requests:', requestsError);
        } else {
          setRequests(requestsData || []);
          
          // Calculate stats
          const completed = requestsData?.filter(r => r.status === 'completed').length || 0;
          const active = requestsData?.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length || 0;
          const totalEarnings = requestsData?.reduce((sum, r) => {
            return r.status === 'completed' ? sum + (r.budget || 0) : sum;
          }, 0) || 0;

          setStats({
            completedJobs: completed,
            activeJobs: active,
            totalEarnings,
            averageRating: providerData.rating || 0,
            reviewCount: providerData.review_count || 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { variant: 'secondary' as const, label: 'Draft' },
      'open': { variant: 'default' as const, label: 'Open' },
      'assigned': { variant: 'outline' as const, label: 'Assigned' },
      'in_progress': { variant: 'default' as const, label: 'In Progress' },
      'completed': { variant: 'default' as const, label: 'Completed' },
      'cancelled': { variant: 'destructive' as const, label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
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

  if (!provider) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="text-center py-12">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Set Up Your Service Provider Profile</h2>
            <p className="text-muted-foreground mb-6">
              Create your service provider profile to start receiving service requests.
            </p>
            <Button onClick={() => navigate('/profile')}>
              Complete Profile Setup
            </Button>
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
            <h1 className="text-3xl font-bold mb-2">Service Provider Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {provider.company_name}</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            {provider.is_verified && (
              <Badge variant="default" className="bg-emerald-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            <Button variant="outline" onClick={() => navigate('/profile')}>
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedJobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reviewCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Service Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Service Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="all">All Requests</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
                <div className="space-y-4">
                  {requests
                    .filter(r => r.status !== 'completed' && r.status !== 'cancelled')
                    .map(request => (
                      <Card key={request.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold">{request.title}</h3>
                                {getStatusBadge(request.status)}
                              </div>
                              <p className="text-muted-foreground mb-2">{request.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center space-x-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>Budget: {formatCurrency(request.budget)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Deadline: {new Date(request.deadline).toLocaleDateString()}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span>{request.entrepreneur.full_name}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => navigate(`/service-requests/${request.id}`)}>
                              View Details
                            </Button>
                            {request.status === 'assigned' && (
                              <Button size="sm" variant="outline">
                                Start Work
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  
                  {requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length === 0 && (
                    <div className="text-center py-12">
                      <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Active Requests</h3>
                      <p className="text-muted-foreground">
                        You don't have any active service requests at the moment.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="space-y-4">
                  {requests
                    .filter(r => r.status === 'completed')
                    .map(request => (
                      <Card key={request.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold">{request.title}</h3>
                                {getStatusBadge(request.status)}
                              </div>
                              <p className="text-muted-foreground mb-2">{request.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center space-x-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>Earned: {formatCurrency(request.budget)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span>{request.entrepreneur.full_name}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/service-requests/${request.id}`)}>
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  
                  {requests.filter(r => r.status === 'completed').length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Completed Requests</h3>
                      <p className="text-muted-foreground">
                        You haven't completed any service requests yet.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {requests.map(request => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold">{request.title}</h3>
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-muted-foreground mb-2">{request.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <DollarSign className="h-3 w-3" />
                                <span>Budget: {formatCurrency(request.budget)}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{request.entrepreneur.full_name}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/service-requests/${request.id}`)}>
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {requests.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Service Requests</h3>
                      <p className="text-muted-foreground">
                        You haven't been assigned any service requests yet.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
