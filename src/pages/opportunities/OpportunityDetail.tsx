
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ModernLayout } from '@/components/Layout/ModernLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Building,
  Calendar,
  User,
  FileText,
  MessageSquare,
  Target,
  AlertCircle,
  Heart,
  Share2,
  Download
} from 'lucide-react';

interface Opportunity {
  id: string;
  name: string;
  description: string | null;
  amount_sought: number;
  expected_roi: number | null;
  industry: string | null;
  status: string;
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

interface OfferFormData {
  amount: string;
  equity_requested: string;
  terms: string;
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [offerForm, setOfferForm] = useState<OfferFormData>({
    amount: '',
    equity_requested: '',
    terms: ''
  });

  useEffect(() => {
    if (id) {
      loadOpportunity();
    }
  }, [id]);

  const loadOpportunity = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
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

      if (error) throw error;

      // Handle the case where entrepreneur might be null or have error
      const processedData = {
        ...data,
        entrepreneur: data.entrepreneur && typeof data.entrepreneur === 'object' && 'full_name' in data.entrepreneur 
          ? data.entrepreneur 
          : null
      };

      setOpportunity(processedData);

    } catch (error) {
      console.error('Error loading opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to load opportunity details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMakeOffer = async () => {
    if (!user || !opportunity) return;

    setIsSubmittingOffer(true);

    try {
      const { error } = await supabase
        .from('offers')
        .insert({
          opportunity_id: opportunity.id,
          investor_id: user.id,
          amount: parseFloat(offerForm.amount),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your investment offer has been submitted.",
      });

      setOfferModalOpen(false);
      setOfferForm({
        amount: '',
        equity_requested: '',
        terms: ''
      });

    } catch (error) {
      console.error('Error submitting offer:', error);
      toast({
        title: "Error",
        description: "Failed to submit your offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  if (loading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-lg">Loading opportunity...</div>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (!opportunity) {
    return (
      <ModernLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Opportunity Not Found</h2>
            <p className="text-muted-foreground mb-4">The opportunity you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/opportunities')}>
              Back to Opportunities
            </Button>
          </div>
        </div>
      </ModernLayout>
    );
  }

  const locationData = opportunity.location_data_jsonb as any;
  const teamData = opportunity.team_data_jsonb as any;
  const profitabilityData = opportunity.profitability_data_jsonb as any;

  return (
    <ModernLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{opportunity.name}</h1>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {opportunity.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {opportunity.industry && (
                      <Badge variant="secondary">
                        {opportunity.industry}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {opportunity.description || 'No description available'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>By {opportunity.entrepreneur?.full_name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(opportunity.created_at || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="lg:w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Investment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount Sought</p>
                    <p className="text-2xl font-bold">{formatCurrency(opportunity.amount_sought)}</p>
                  </div>
                  
                  {opportunity.expected_roi && (
                    <div>
                      <p className="text-sm text-muted-foreground">Expected ROI</p>
                      <p className="text-xl font-semibold text-green-600">{opportunity.expected_roi}%</p>
                    </div>
                  )}

                  <div className="pt-4 space-y-2">
                    {user?.role === 'investor' && (
                      <Dialog open={offerModalOpen} onOpenChange={setOfferModalOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full" size="lg">
                            Make Investment Offer
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Make Investment Offer</DialogTitle>
                            <DialogDescription>
                              Submit your investment offer for this opportunity
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="amount">Investment Amount</Label>
                              <Input
                                id="amount"
                                type="number"
                                value={offerForm.amount}
                                onChange={(e) => setOfferForm(prev => ({ ...prev, amount: e.target.value }))}
                                placeholder="Enter amount"
                              />
                            </div>
                            <div>
                              <Label htmlFor="equity">Equity Requested (%)</Label>
                              <Input
                                id="equity"
                                type="number"
                                value={offerForm.equity_requested}
                                onChange={(e) => setOfferForm(prev => ({ ...prev, equity_requested: e.target.value }))}
                                placeholder="Enter equity percentage"
                              />
                            </div>
                            <div>
                              <Label htmlFor="terms">Additional Terms</Label>
                              <Textarea
                                id="terms"
                                value={offerForm.terms}
                                onChange={(e) => setOfferForm(prev => ({ ...prev, terms: e.target.value }))}
                                placeholder="Any additional terms or conditions"
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={handleMakeOffer}
                                disabled={isSubmittingOffer}
                                className="flex-1"
                              >
                                {isSubmittingOffer ? 'Submitting...' : 'Submit Offer'}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setOfferModalOpen(false)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Heart className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {opportunity.description || 'No detailed description available.'}
                    </p>
                  </CardContent>
                </Card>

                {teamData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {teamData.opportunity_type && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Opportunity Type</p>
                          <p className="font-medium">{teamData.opportunity_type}</p>
                        </div>
                      )}
                      {locationData?.location && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Location</p>
                          <p className="font-medium">{locationData.location}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Entrepreneur
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
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
                        <p className="font-semibold">{opportunity.entrepreneur?.full_name || 'Unknown'}</p>
                        {opportunity.entrepreneur?.email && (
                          <p className="text-sm text-muted-foreground">{opportunity.entrepreneur.email}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Entrepreneur
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Funding Goal</span>
                      <span className="font-medium">{formatCurrency(opportunity.amount_sought)}</span>
                    </div>
                    {opportunity.expected_roi && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected ROI</span>
                        <span className="font-medium text-green-600">{opportunity.expected_roi}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Industry</span>
                      <span className="font-medium">{opportunity.industry || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="financials">
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Financial details and projections will be displayed here once available.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Team member details and experience will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents & Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No documents available yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
}
