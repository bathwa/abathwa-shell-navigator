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
  User
} from 'lucide-react';

interface Opportunity {
  id: string;
  name: string;
  description: string;
  amount_sought: number;
  expected_roi: number;
  industry: string;
  status: 'pending_review' | 'approved' | 'rejected';
  created_at: string;
  entrepreneur_name: string;
  entrepreneur_email: string;
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
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockOpportunities: Opportunity[] = [
        {
          id: '1',
          name: 'Tech Startup Alpha',
          description: 'Innovative AI-powered solution for enterprise automation',
          amount_sought: 500000,
          expected_roi: 25,
          industry: 'Technology',
          status: 'pending_review',
          created_at: '2024-03-01',
          entrepreneur_name: 'John Smith',
          entrepreneur_email: 'john@techstartup.com'
        },
        {
          id: '2',
          name: 'Green Energy Project',
          description: 'Renewable energy infrastructure development',
          amount_sought: 750000,
          expected_roi: 18,
          industry: 'Energy',
          status: 'pending_review',
          created_at: '2024-02-28',
          entrepreneur_name: 'Sarah Johnson',
          entrepreneur_email: 'sarah@greenenergy.com'
        },
        {
          id: '3',
          name: 'Healthcare Innovation',
          description: 'Advanced medical device for remote patient monitoring',
          amount_sought: 300000,
          expected_roi: 30,
          industry: 'Healthcare',
          status: 'approved',
          created_at: '2024-02-25',
          entrepreneur_name: 'Dr. Michael Chen',
          entrepreneur_email: 'michael@healthcare.com'
        },
        {
          id: '4',
          name: 'Real Estate Development',
          description: 'Mixed-use commercial and residential development',
          amount_sought: 1200000,
          expected_roi: 15,
          industry: 'Real Estate',
          status: 'rejected',
          created_at: '2024-02-20',
          entrepreneur_name: 'Lisa Rodriguez',
          entrepreneur_email: 'lisa@realestate.com'
        }
      ];

      setOpportunities(mockOpportunities);

      // Calculate stats
      const pendingReview = mockOpportunities.filter(o => o.status === 'pending_review').length;
      const approved = mockOpportunities.filter(o => o.status === 'approved').length;
      const rejected = mockOpportunities.filter(o => o.status === 'rejected').length;
      const totalOpportunities = mockOpportunities.length;

      setStats({
        pendingReview,
        approved,
        rejected,
        totalOpportunities
      });
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending Review
        </Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleReview = (opportunityId: string) => {
    navigate(`/admin/opportunities/${opportunityId}/review`);
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading opportunities...</div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Opportunity Review</h1>
          <p className="text-muted-foreground">Review and manage investment opportunities</p>
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
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">
                Successfully approved
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
            <TabsTrigger value="approved">Approved</TabsTrigger>
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
                      <div key={opportunity.id} className="border rounded-lg p-6 space-y-4">
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
                              <span className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>{opportunity.expected_roi}% ROI</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(opportunity.created_at).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{opportunity.entrepreneur_name}</span>
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

          <TabsContent value="approved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Approved Opportunities</CardTitle>
                <CardDescription>Successfully approved investment opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                {opportunities.filter(o => o.status === 'approved').length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.filter(o => o.status === 'approved').map((opportunity) => (
                      <div key={opportunity.id} className="border rounded-lg p-6 space-y-4">
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
                              <span className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>{opportunity.expected_roi}% ROI</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(opportunity.created_at).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{opportunity.entrepreneur_name}</span>
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
                    <h3 className="text-lg font-semibold mb-2">No approved opportunities</h3>
                    <p className="text-muted-foreground mb-4">
                      Approved opportunities will appear here
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
                      <div key={opportunity.id} className="border rounded-lg p-6 space-y-4">
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
                              <span className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>{opportunity.expected_roi}% ROI</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(opportunity.created_at).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{opportunity.entrepreneur_name}</span>
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