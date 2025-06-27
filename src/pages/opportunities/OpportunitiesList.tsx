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
  TrendingUp, 
  Calendar, 
  MapPin,
  Building2,
  Eye
} from 'lucide-react';

interface Opportunity {
  id: string;
  name: string;
  description: string;
  amount_sought: number;
  expected_roi: number;
  industry: string;
  status: 'published' | 'funded';
  created_at: string;
  location: string;
  entrepreneur_name: string;
}

export default function OpportunitiesList() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [roiFilter, setRoiFilter] = useState('');
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    loadOpportunities();
  }, []);

  useEffect(() => {
    filterOpportunities();
  }, [opportunities, searchTerm, industryFilter, roiFilter]);

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
          status: 'published',
          created_at: '2024-03-01',
          location: 'San Francisco, CA',
          entrepreneur_name: 'John Smith'
        },
        {
          id: '2',
          name: 'Green Energy Project',
          description: 'Renewable energy infrastructure development',
          amount_sought: 750000,
          expected_roi: 18,
          industry: 'Energy',
          status: 'published',
          created_at: '2024-02-28',
          location: 'Austin, TX',
          entrepreneur_name: 'Sarah Johnson'
        },
        {
          id: '3',
          name: 'Healthcare Innovation',
          description: 'Advanced medical device for remote patient monitoring',
          amount_sought: 300000,
          expected_roi: 30,
          industry: 'Healthcare',
          status: 'published',
          created_at: '2024-02-25',
          location: 'Boston, MA',
          entrepreneur_name: 'Dr. Michael Chen'
        },
        {
          id: '4',
          name: 'Real Estate Development',
          description: 'Mixed-use commercial and residential development',
          amount_sought: 1200000,
          expected_roi: 15,
          industry: 'Real Estate',
          status: 'funded',
          created_at: '2024-02-20',
          location: 'Miami, FL',
          entrepreneur_name: 'Lisa Rodriguez'
        }
      ];

      setOpportunities(mockOpportunities);
    } catch (error) {
      console.error('Error loading opportunities:', error);
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
        opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.entrepreneur_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Industry filter
    if (industryFilter) {
      filtered = filtered.filter(opp => opp.industry === industryFilter);
    }

    // ROI filter
    if (roiFilter) {
      const minRoi = parseInt(roiFilter);
      filtered = filtered.filter(opp => opp.expected_roi >= minRoi);
    }

    setFilteredOpportunities(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Open for Investment</Badge>;
      case 'funded':
        return <Badge className="bg-blue-100 text-blue-800">Funded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getIndustryIcon = (industry: string) => {
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

  const industries = ['Technology', 'Energy', 'Healthcare', 'Real Estate', 'Finance', 'Education', 'Retail', 'Manufacturing'];

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
          <h1 className="text-3xl font-bold mb-2">Browse Opportunities</h1>
          <p className="text-muted-foreground">Discover investment opportunities that match your criteria</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={roiFilter} onValueChange={setRoiFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Min ROI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any ROI</SelectItem>
                  <SelectItem value="10">10%+</SelectItem>
                  <SelectItem value="15">15%+</SelectItem>
                  <SelectItem value="20">20%+</SelectItem>
                  <SelectItem value="25">25%+</SelectItem>
                  <SelectItem value="30">30%+</SelectItem>
                </SelectContent>
              </Select>

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
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            Showing {filteredOpportunities.length} of {opportunities.length} opportunities
          </p>
        </div>

        {/* Opportunities Grid */}
        {filteredOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getIndustryIcon(opportunity.industry)}
                        <span className="text-sm text-muted-foreground">{opportunity.industry}</span>
                      </div>
                      <CardTitle className="text-lg">{opportunity.name}</CardTitle>
                      {getStatusBadge(opportunity.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground line-clamp-3">
                    {opportunity.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Funding Sought:</span>
                      <span className="font-semibold">{formatCurrency(opportunity.amount_sought)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Expected ROI:</span>
                      <span className="font-semibold text-green-600">{opportunity.expected_roi}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Location:</span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{opportunity.location}</span>
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Posted:</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(opportunity.created_at).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        by {opportunity.entrepreneur_name}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters to find more opportunities
              </p>
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
            </CardContent>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
} 