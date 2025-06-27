import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  TrendingUp,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type OpportunityStatus = Database['public']['Enums']['opportunity_status'];

interface Opportunity {
  id: string;
  name: string;
  description: string | null;
  amount_sought: number;
  expected_roi: number | null;
  industry: string | null;
  status: OpportunityStatus;
  created_at: string | null;
  entrepreneur_id: string;
  entrepreneur?: {
    full_name: string | null;
    avatar_url?: string | null;
    email?: string | null;
  };
}

interface ReviewStats {
  pendingReview: number;
  approved: number;
  rejected: number;
  totalOpportunities: number;
}

export default function OpportunityReviewList() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    totalOpportunities: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real opportunities from Supabase with entrepreneur details
      const { data, error: fetchError } = await supabase
        .from('opportunities')
        .select(`
          *,
          entrepreneur:profiles!opportunities_entrepreneur_id_fkey(
            full_name,
            avatar_url,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching opportunities:', fetchError);
        setError('Failed to load opportunities. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load opportunities data.",
          variant: "destructive",
        });
        return;
      }

      const opportunitiesData = data || [];
      setOpportunities(opportunitiesData);

      // Calculate stats from real data
      const pendingReview = opportunitiesData.filter(o => o.status === 'pending_review').length;
      const approved = opportunitiesData.filter(o => o.status === 'published').length;
      const rejected = opportunitiesData.filter(o => o.status === 'rejected').length;
      const totalOpportunities = opportunitiesData.length;

      setStats({
        pendingReview,
        approved,
        rejected,
        totalOpportunities
      });

    } catch (error) {
      console.error('Error loading opportunities:', error);
      setError('An unexpected error occurred. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load opportunities data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: OpportunityStatus) => {
    switch (status) {
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending Review
        </Badge>;
      case 'published':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Published
        </Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Draft
        </Badge>;
      case 'funded':
        return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Funded
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleReview = (opportunityId: string) => {
    navigate(`/admin/opportunities/${opportunityId}/review`);
  };

  const handleRefresh = () => {
    loadOpportunities();
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-lg">Loading opportunities...</div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Opportunity Review</h1>
            <p className="text-muted-foreground">Review and manage investment opportunities</p>
          </div>
          
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Opportunities</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Opportunity Review</h1>
            <p className="text-muted-foreground">Review and manage investment opportunities</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        {/* Review Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReview}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">
                Successfully published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <p className="text-xs text-muted-foreground">
                Not approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
              <p className="text-xs text-muted-foreground">
                All opportunities
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Review</CardTitle>
                <CardDescription>Opportunities awaiting admin approval</CardDescription>
              </CardHeader>
              <CardContent>
                {opportunities.filter(o => o.status === 'pending_review').length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.filter(o => o.status === 'pending_review').map((opportunity) => (
                      <div key={opportunity.id} className="border rounded-lg p-6 space-y-4" data-testid="opportunity-item">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold">{opportunity.name}</h3>
                              {getStatusBadge(opportunity.status)}
                            </div>
                            <p className="text-muted-foreground">{opportunity.description}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>{formatCurrency(opportunity.amount_sought)}</span>
                              </span>
                              {opportunity.expected_roi && (
                                <span className="flex items-center space-x-1">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>{opportunity.expected_roi}% ROI</span>
                                </span>
                              )}
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{opportunity.created_at ? new Date(opportunity.created_at).toLocaleDateString() : 'N/A'}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{opportunity.entrepreneur?.full_name || 'Unknown'}</span>
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
                              onClick={() => handleReview(opportunity.id)}
                              data-testid="review-opportunity"
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pending reviews</h3>
                    <p className="text-muted-foreground mb-4">
                      All opportunities have been reviewed
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="published" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Published Opportunities</CardTitle>
                <CardDescription>Successfully published investment opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                {opportunities.filter(o => o.status === 'published').length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.filter(o => o.status === 'published').map((opportunity) => (
                      <div key={opportunity.id} className="border rounded-lg p-6 space-y-4" data-testid="opportunity-item">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold">{opportunity.name}</h3>
                              {getStatusBadge(opportunity.status)}
                            </div>
                            <p className="text-muted-foreground">{opportunity.description}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>{formatCurrency(opportunity.amount_sought)}</span>
                              </span>
                              {opportunity.expected_roi && (
                                <span className="flex items-center space-x-1">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>{opportunity.expected_roi}% ROI</span>
                                </span>
                              )}
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{opportunity.created_at ? new Date(opportunity.created_at).toLocaleDateString() : 'N/A'}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{opportunity.entrepreneur?.full_name || 'Unknown'}</span>
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No published opportunities</h3>
                    <p className="text-muted-foreground mb-4">
                      Published opportunities will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Opportunities</CardTitle>
                <CardDescription>Opportunities that were not approved</CardDescription>
              </CardHeader>
              <CardContent>
                {opportunities.filter(o => o.status === 'rejected').length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.filter(o => o.status === 'rejected').map((opportunity) => (
                      <div key={opportunity.id} className="border rounded-lg p-6 space-y-4" data-testid="opportunity-item">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold">{opportunity.name}</h3>
                              {getStatusBadge(opportunity.status)}
                            </div>
                            <p className="text-muted-foreground">{opportunity.description}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>{formatCurrency(opportunity.amount_sought)}</span>
                              </span>
                              {opportunity.expected_roi && (
                                <span className="flex items-center space-x-1">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>{opportunity.expected_roi}% ROI</span>
                                </span>
                              )}
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{opportunity.created_at ? new Date(opportunity.created_at).toLocaleDateString() : 'N/A'}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{opportunity.entrepreneur?.full_name || 'Unknown'}</span>
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No rejected opportunities</h3>
                    <p className="text-muted-foreground mb-4">
                      Rejected opportunities will appear here
                    </p>
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