
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ModernLayout } from '@/components/Layout/ModernLayout';
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
  } | null;
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

      // Process the data to handle potential null/error values
      const processedData = (data || []).map(item => ({
        ...item,
        entrepreneur: item.entrepreneur && typeof item.entrepreneur === 'object' && 'full_name' in item.entrepreneur 
          ? item.entrepreneur 
          : null
      })) as Opportunity[];

      setOpportunities(processedData);

      // Calculate stats from real data
      const pendingReview = processedData.filter(o => o.status === 'pending_review').length;
      const approved = processedData.filter(o => o.status === 'published').length;
      const rejected = processedData.filter(o => o.status === 'rejected').length;
      const totalOpportunities = processedData.length;

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
      <ModernLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-lg">Loading opportunities...</div>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (error) {
    return (
      <ModernLayout>
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
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
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

        <Tabs defaultValue="published" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="rejected">Suspended/Removed</TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Published Opportunities</CardTitle>
                <CardDescription>Live opportunities available for investment</CardDescription>
              </CardHeader>
              <CardContent>
                {opportunities.filter(o => o.status === 'published').length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.filter(o => o.status === 'published').map((opportunity) => (
                      <div key={opportunity.id} className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold">{opportunity.name}</h3>
                              {getStatusBadge(opportunity.status)}
                            </div>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {opportunity.description || 'No description available'}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <DollarSign className="h-3 w-3" />
                                <span>{formatCurrency(opportunity.amount_sought)}</span>
                              </span>
                              {opportunity.expected_roi && (
                                <span className="flex items-center space-x-1">
                                  <TrendingUp className="h-3 w-3" />
                                  <span>{opportunity.expected_roi}% ROI</span>
                                </span>
                              )}
                              <span className="flex items-center space-x-1">
                                <Building className="h-3 w-3" />
                                <span>{opportunity.industry || 'N/A'}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{opportunity.created_at ? new Date(opportunity.created_at).toLocaleDateString() : 'N/A'}</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                By {opportunity.entrepreneur?.full_name || 'Unknown Entrepreneur'}
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleReview(opportunity.id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Review</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No published opportunities</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="draft" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Draft Opportunities</CardTitle>
                <CardDescription>Opportunities in draft status</CardDescription>
              </CardHeader>
              <CardContent>
                {opportunities.filter(o => o.status === 'draft').length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.filter(o => o.status === 'draft').map((opportunity) => (
                      <div key={opportunity.id} className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold">{opportunity.name}</h3>
                              {getStatusBadge(opportunity.status)}
                            </div>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {opportunity.description || 'No description available'}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <DollarSign className="h-3 w-3" />
                                <span>{formatCurrency(opportunity.amount_sought)}</span>
                              </span>
                              {opportunity.expected_roi && (
                                <span className="flex items-center space-x-1">
                                  <TrendingUp className="h-3 w-3" />
                                  <span>{opportunity.expected_roi}% ROI</span>
                                </span>
                              )}
                              <span className="flex items-center space-x-1">
                                <Building className="h-3 w-3" />
                                <span>{opportunity.industry || 'N/A'}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{opportunity.created_at ? new Date(opportunity.created_at).toLocaleDateString() : 'N/A'}</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                By {opportunity.entrepreneur?.full_name || 'Unknown Entrepreneur'}
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleReview(opportunity.id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Review</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No draft opportunities</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Suspended/Removed Opportunities</CardTitle>
                <CardDescription>Opportunities that have been suspended or removed</CardDescription>
              </CardHeader>
              <CardContent>
                {opportunities.filter(o => o.status === 'rejected').length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.filter(o => o.status === 'rejected').map((opportunity) => (
                      <div key={opportunity.id} className="border rounded-lg p-6 space-y-4 bg-red-50">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold">{opportunity.name}</h3>
                              {getStatusBadge(opportunity.status)}
                            </div>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {opportunity.description || 'No description available'}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <DollarSign className="h-3 w-3" />
                                <span>{formatCurrency(opportunity.amount_sought)}</span>
                              </span>
                              {opportunity.expected_roi && (
                                <span className="flex items-center space-x-1">
                                  <TrendingUp className="h-3 w-3" />
                                  <span>{opportunity.expected_roi}% ROI</span>
                                </span>
                              )}
                              <span className="flex items-center space-x-1">
                                <Building className="h-3 w-3" />
                                <span>{opportunity.industry || 'N/A'}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{opportunity.created_at ? new Date(opportunity.created_at).toLocaleDateString() : 'N/A'}</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                By {opportunity.entrepreneur?.full_name || 'Unknown Entrepreneur'}
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleReview(opportunity.id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Review</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No suspended or removed opportunities</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
}
