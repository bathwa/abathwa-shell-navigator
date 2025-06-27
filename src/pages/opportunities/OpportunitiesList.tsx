import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout';
import { 
  Search, 
  Filter, 
  Building2, 
  TrendingUp, 
  Calendar, 
  User, 
  MapPin,
  AlertCircle,
  RefreshCw
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
  location_data_jsonb?: any;
  entrepreneur?: {
    full_name: string | null;
    avatar_url?: string | null;
  };
}

export default function OpportunitiesList() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [roiFilter, setRoiFilter] = useState('');
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();

  useEffect(() => {
    loadOpportunities();
  }, []);

  useEffect(() => {
    filterOpportunities();
  }, [opportunities, searchTerm, industryFilter, roiFilter]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real published opportunities from Supabase with entrepreneur details
      const { data, error: fetchError } = await supabase
        .from('opportunities')
        .select(`
          *,
          entrepreneur:profiles!opportunities_entrepreneur_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'published')
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

  const filterOpportunities = () => {
    let filtered = opportunities;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(opp => 
        opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opp.description && opp.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (opp.entrepreneur?.full_name && opp.entrepreneur.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Industry filter
    if (industryFilter) {
      filtered = filtered.filter(opp => opp.industry === industryFilter);
    }

    // ROI filter
    if (roiFilter && opp.expected_roi) {
      const minRoi = parseInt(roiFilter);
      filtered = filtered.filter(opp => opp.expected_roi && opp.expected_roi >= minRoi);
    }

    setFilteredOpportunities(filtered);
  };

  const getStatusBadge = (status: OpportunityStatus) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Open for Investment</Badge>;
      case 'funded':
        return <Badge className="bg-blue-100 text-blue-800">Funded</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getIndustryIcon = (industry: string | null) => {
    switch (industry) {
      case 'Technology':
        return <Building2 className="h-4 w-4" />;
      case 'Energy':
        return <TrendingUp className="h-4 w-4" />;
      case 'Healthcare':
        return <Building2 className="h-4 w-4" />;
      case 'Real Estate':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const handleRefresh = () => {
    loadOpportunities();
  };

  // Get unique industries from actual data
  const industries = Array.from(new Set(opportunities.map(opp => opp.industry).filter(Boolean)));

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
            <h1 className="text-3xl font-bold mb-2">Investment Opportunities</h1>
            <p className="text-muted-foreground">Discover and invest in promising ventures</p>
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
            <h1 className="text-3xl font-bold mb-2">Investment Opportunities</h1>
            <p className="text-muted-foreground">Discover and invest in promising ventures</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry || ''}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roiFilter} onValueChange={setRoiFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All ROI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All ROI</SelectItem>
                <SelectItem value="10">10%+ ROI</SelectItem>
                <SelectItem value="15">15%+ ROI</SelectItem>
                <SelectItem value="20">20%+ ROI</SelectItem>
                <SelectItem value="25">25%+ ROI</SelectItem>
                <SelectItem value="30">30%+ ROI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredOpportunities.length} of {opportunities.length} opportunities
          </p>
        </div>

        {/* Opportunities Grid */}
        {filteredOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow cursor-pointer" data-testid="opportunity-item">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getIndustryIcon(opportunity.industry)}
                      <div>
                        <CardTitle className="text-lg">{opportunity.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {opportunity.industry || 'Uncategorized'}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(opportunity.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {opportunity.description || 'No description available'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount Sought</p>
                      <p className="font-semibold">{formatCurrency(opportunity.amount_sought)}</p>
                    </div>
                    {opportunity.expected_roi && (
                      <div>
                        <p className="text-muted-foreground">Expected ROI</p>
                        <p className="font-semibold text-green-600">{opportunity.expected_roi}%</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{opportunity.created_at ? new Date(opportunity.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{opportunity.entrepreneur?.full_name || 'Unknown'}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
            <p className="text-muted-foreground mb-4">
              {opportunities.length === 0 
                ? "No investment opportunities are currently available."
                : "No opportunities match your current filters."
              }
            </p>
            {opportunities.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setIndustryFilter('');
                  setRoiFilter('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
} 