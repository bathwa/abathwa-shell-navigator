import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, DollarSign, TrendingUp, Building, Calendar, User, FileText, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModernLayout } from '@/components/Layout/ModernLayout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
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
  } | null;
}

const OpportunityReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        .single();

      if (fetchError) {
        console.error('Error fetching opportunity:', fetchError);
        if (fetchError.code === 'PGRST116') {
          setError('Opportunity not found.');
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

      // Handle the case where entrepreneur might be null or have error
      let processedEntrepreneur = null;
      const entrepreneur = data.entrepreneur;
      if (entrepreneur && typeof entrepreneur === 'object') {
        const ent = entrepreneur as any;
        processedEntrepreneur = {
          full_name: ent.full_name || null,
          avatar_url: ent.avatar_url || null,
          email: ent.email || null
        };
      }

      const processedData: Opportunity = {
        ...data,
        entrepreneur: processedEntrepreneur
      };

      setOpportunity(processedData);

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

  const handleApprove = async () => {
    if (!opportunity) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('opportunities')
        .update({ 
          status: 'published',
          team_data_jsonb: {
            ...opportunity.team_data_jsonb,
            admin_review_notes: reviewNotes,
            reviewed_at: new Date().toISOString()
          }
        })
        .eq('id', opportunity.id);

      if (error) throw error;

      toast({
        title: "Opportunity Approved",
        description: "The opportunity has been published successfully.",
      });

      navigate('/admin/opportunities/review-list');

    } catch (error) {
      console.error('Error approving opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to approve opportunity.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!opportunity) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('opportunities')
        .update({ 
          status: 'rejected',
          team_data_jsonb: {
            ...opportunity.team_data_jsonb,
            admin_review_notes: reviewNotes,
            rejection_reason: reviewNotes,
            reviewed_at: new Date().toISOString()
          }
        })
        .eq('id', opportunity.id);

      if (error) throw error;

      toast({
        title: "Opportunity Rejected",
        description: "The opportunity has been rejected.",
      });

      navigate('/admin/opportunities/review-list');

    } catch (error) {
      console.error('Error rejecting opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to reject opportunity.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    loadOpportunity();
  };

  if (loading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-lg">Loading opportunity details...</div>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (error || !opportunity) {
    return (
      <ModernLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/opportunities/review-list')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Review List
            </Button>
            <h1 className="text-3xl font-bold mb-2">Opportunity Review</h1>
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
      </ModernLayout>
    );
  }

  // Extract data from JSONB fields
  const locationData = opportunity.location_data_jsonb as any;
  const teamData = opportunity.team_data_jsonb as any;
  const profitabilityData = opportunity.profitability_data_jsonb as any;

  return (
    <ModernLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/opportunities/review-list')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Review List
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
            <Badge variant="outline" className="text-lg px-4 py-2">
              {opportunity.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          
          <p className="text-muted-foreground leading-relaxed">
            {opportunity.description || 'No description available'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Investment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
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
                    <Building className="h-5 w-5" />
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
                      <p className="font-medium">{locationData.location}</p>
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
                    <AlertCircle className="h-5 w-5" />
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
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${teamData.risk_assessment.overallRisk}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {teamData.risk_assessment.factors && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Key Risk Factors</p>
                        <ul className="space-y-1">
                          {teamData.risk_assessment.factors.map((factor: string, index: number) => (
                            <li key={index} className="text-sm flex items-center space-x-2">
                              <AlertCircle className="h-3 w-3 text-yellow-500" />
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
                    <TrendingUp className="h-5 w-5" />
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
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-medium">
                      {opportunity.created_at ? new Date(opportunity.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Review Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add your review notes here..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Review Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Review Decision</CardTitle>
                <CardDescription>Make your decision on this opportunity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Publish
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleReject}
                  disabled={isSubmitting}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
};

export default OpportunityReview;
