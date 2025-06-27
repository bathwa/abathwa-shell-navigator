import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { useCurrency } from '@/contexts/CurrencyContext';
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target, 
  Calendar, 
  MessageSquare, 
  Eye,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Brain,
  FileText,
  Building,
  Heart,
  User,
  MapPin,
  Building2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
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
  team_data_jsonb?: any;
  profitability_data_jsonb?: any;
  entrepreneur?: {
    full_name: string | null;
    avatar_url?: string | null;
    email?: string | null;
  };
}

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadOpportunity();
    }
  }, [id]);

  const loadOpportunity = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

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
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (fetchError) {
        console.error('Error fetching opportunity:', fetchError);
        if (fetchError.code === 'PGRST116') {
          setError('Opportunity not found or not published.');
        } else {
          setError('Failed to load opportunity details. Please try again.');
        }
        toast({
          title: "Error",
          description: "Failed to load opportunity data.",
          variant: "destructive",
        });
        return;
      }

      setOpportunity(data);

    } catch (error) {
      console.error('Error loading opportunity:', error);
      setError('An unexpected error occurred. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load opportunity data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = () => {
    if (!opportunity) return;
    
    console.log('Expressing interest in opportunity:', opportunity.id);
    // In real app, this would create an offer in Supabase
    toast({
      title: "Interest Expressed",
      description: "Your interest has been recorded. The entrepreneur will be notified.",
    });
  };

  const handleRefresh = () => {
    loadOpportunity();
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

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-lg">Loading opportunity details...</div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !opportunity) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/opportunities/list')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Opportunities
            </Button>
            <h1 className="text-3xl font-bold mb-2">Opportunity Details</h1>
          </div>
          
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Opportunity</h3>
              <p className="text-muted-foreground mb-4">{error || 'Opportunity not found'}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Extract data from JSONB fields
  const locationData = opportunity.location_data_jsonb as any;
  const teamData = opportunity.team_data_jsonb as any;
  const profitabilityData = opportunity.profitability_data_jsonb as any;

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate('/opportunities/list')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Opportunities
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{opportunity.name}</h1>
              <p className="text-muted-foreground text-lg">
                {opportunity.industry || 'Uncategorized Industry'}
              </p>
            </div>
            {getStatusBadge(opportunity.status)}
          </div>
          
          <p className="text-muted-foreground leading-relaxed">
            {opportunity.description || 'No description available'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Investment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount Sought</p>
                    <p className="text-2xl font-bold">{formatCurrency(opportunity.amount_sought)}</p>
                  </div>
                  {opportunity.expected_roi && (
                    <div>
                      <p className="text-sm text-muted-foreground">Expected ROI</p>
                      <p className="text-2xl font-bold text-green-600">{opportunity.expected_roi}%</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Details */}
            {teamData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Business Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamData.opportunity_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">Opportunity Type</p>
                      <p className="font-medium">{teamData.opportunity_type}</p>
                    </div>
                  )}
                  {locationData?.team_size && (
                    <div>
                      <p className="text-sm text-muted-foreground">Team Size</p>
                      <p className="font-medium">{locationData.team_size} members</p>
                    </div>
                  )}
                  {locationData?.experience_years && (
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium">{locationData.experience_years} years</p>
                    </div>
                  )}
                  {locationData?.location && (
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{locationData.location}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Risk Assessment */}
            {teamData?.risk_assessment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Risk Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamData.risk_assessment.overallRisk && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Risk Level</span>
                          <span>{teamData.risk_assessment.overallRisk}%</span>
                        </div>
                        <Progress value={teamData.risk_assessment.overallRisk} className="h-2" />
                      </div>
                    )}
                    {teamData.risk_assessment.factors && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Key Risk Factors</p>
                        <ul className="space-y-1">
                          {teamData.risk_assessment.factors.map((factor: string, index: number) => (
                            <li key={index} className="text-sm flex items-center space-x-2">
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Milestones */}
            {teamData?.milestones && teamData.milestones.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Project Milestones</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamData.milestones.map((milestone: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <Badge variant="outline">{milestone.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                        <div className="flex justify-between text-sm">
                          <span>Target: {milestone.target_date}</span>
                          {milestone.amount_allocated && (
                            <span>Budget: {formatCurrency(milestone.amount_allocated)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Entrepreneur Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Entrepreneur</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {opportunity.entrepreneur?.avatar_url ? (
                      <img 
                        src={opportunity.entrepreneur.avatar_url} 
                        alt="Entrepreneur" 
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{opportunity.entrepreneur?.full_name || 'Unknown'}</p>
                      {opportunity.entrepreneur?.email && (
                        <p className="text-sm text-muted-foreground">{opportunity.entrepreneur.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Action */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Investment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Created</p>
                    <p className="font-medium">
                      {opportunity.created_at ? new Date(opportunity.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleExpressInterest}
                    size="lg"
                  >
                    Express Interest
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    This will notify the entrepreneur of your interest
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Due Diligence Status */}
            {profitabilityData?.due_diligence_completed !== undefined && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Due Diligence</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    {profitabilityData.due_diligence_completed ? (
                      <>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Completed</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium">Pending</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default OpportunityDetail;
