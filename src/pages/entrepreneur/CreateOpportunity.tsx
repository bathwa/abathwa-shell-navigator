import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { ArrowLeft, Upload, Save, Eye, Send, FileText, Calendar, DollarSign, Users, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { aiService } from '@/services/aiService';
import { drbeService } from '@/services/drbeService';
import { useAuthStore } from '@/store/authStore';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useDataStore } from '@/store/useDataStore';

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  amountAllocated: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

interface OpportunityData {
  name: string;
  description: string;
  amountSought: number;
  expectedRoi: number;
  industry: string;
  opportunityType: 'going_concern' | 'order_fulfillment' | 'project_partnership';
  teamSize: number;
  experienceYears: number;
  location: string;
  businessPlan: File | null;
  financialProjections: File | null;
  teamResumes: File | null;
  marketAnalysis: File | null;
  milestones: Milestone[];
  dueDiligenceCompleted: boolean;
  riskAssessment: any;
}

export default function CreateOpportunity() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { addOpportunity } = useDataStore();
  const { formatCurrency, selectedCurrency } = useCurrency();
  const { id } = useParams();
  
  const [opportunityData, setOpportunityData] = useState<OpportunityData>({
    name: '',
    description: '',
    amountSought: 0,
    expectedRoi: 0,
    industry: '',
    opportunityType: 'going_concern',
    teamSize: 1,
    experienceYears: 0,
    location: '',
    businessPlan: null,
    financialProjections: null,
    teamResumes: null,
    marketAnalysis: null,
    milestones: [],
    dueDiligenceCompleted: false,
    riskAssessment: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('basic');

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
    'Real Estate', 'Transportation', 'Energy', 'Agriculture', 'Entertainment', 'Other'
  ];

  useEffect(() => {
    calculateCompletionProgress();
  }, [opportunityData]);

  useEffect(() => {
    // Load existing opportunity data if editing
    if (id) {
      loadExistingOpportunity();
    }
  }, [id, user]);

  const loadExistingOpportunity = async () => {
    if (!id || !user) return;

    try {
      setIsLoading(true);
      
      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .eq('entrepreneur_id', user.id)
        .single();

      if (error) throw error;

      if (opportunity) {
        // Convert database format to component format
        const locationData = opportunity.location_data_jsonb as any;
        const teamData = opportunity.team_data_jsonb as any;
        const profitabilityData = opportunity.profitability_data_jsonb as any;
        
        setOpportunityData({
          name: opportunity.name || '',
          description: opportunity.description || '',
          amountSought: opportunity.amount_sought || 0,
          expectedRoi: opportunity.expected_roi || 0,
          industry: opportunity.industry || '',
          opportunityType: teamData?.opportunity_type || 'going_concern',
          teamSize: locationData?.team_size || 1,
          experienceYears: locationData?.experience_years || 0,
          location: locationData?.location || '',
          businessPlan: null, // Files would need separate handling
          financialProjections: null,
          teamResumes: null,
          marketAnalysis: null,
          milestones: teamData?.milestones || [],
          dueDiligenceCompleted: profitabilityData?.due_diligence_completed || false,
          riskAssessment: teamData?.risk_assessment || null
        });

        // Load AI insights if available
        if (teamData?.aiInsights) {
          setAiInsights(teamData.aiInsights);
        }
      }
    } catch (error) {
      console.error('Error loading opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to load opportunity data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompletionProgress = () => {
    const requiredFields = [
      opportunityData.name,
      opportunityData.description,
      opportunityData.amountSought,
      opportunityData.expectedRoi,
      opportunityData.industry,
      opportunityData.location,
      opportunityData.teamSize,
      opportunityData.experienceYears
    ];

    const completedFields = requiredFields.filter(field => 
      field && (typeof field === 'string' ? field.trim() !== '' : field > 0)
    ).length;

    const progress = Math.round((completedFields / requiredFields.length) * 100);
    setCompletionProgress(progress);
  };

  const handleInputChange = (field: keyof OpportunityData, value: any) => {
    setOpportunityData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (field: keyof OpportunityData, file: File) => {
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `opportunities/${user?.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) throw error;

      handleInputChange(field, file);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded.`,
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: '',
      description: '',
      targetDate: '',
      amountAllocated: 0,
      status: 'pending'
    };

    setOpportunityData(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }));
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
    setOpportunityData(prev => ({
      ...prev,
      milestones: prev.milestones.map(milestone =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    }));
  };

  const removeMilestone = (id: string) => {
    setOpportunityData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(milestone => milestone.id !== id)
    }));
  };

  const runDueDiligence = async () => {
    setIsLoading(true);
    try {
      // Run AI risk assessment
      const riskAssessment = await aiService.assessRisk(opportunityData);
      
      // Classify opportunity type
      const classification = await aiService.classifyOpportunity(opportunityData);
      
      // Analyze description
      const textAnalysis = await aiService.analyzeText(opportunityData.description);

      setAiInsights({
        riskAssessment,
        classification,
        textAnalysis
      });

      setOpportunityData(prev => ({
        ...prev,
        riskAssessment,
        dueDiligenceCompleted: true
      }));

      toast({
        title: "Due diligence completed",
        description: "AI analysis has been completed successfully.",
      });
    } catch (error) {
      console.error('Due diligence error:', error);
      toast({
        title: "Due diligence failed",
        description: "Failed to complete AI analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveAsDraft = async () => {
    setIsSaving(true);
    try {
      const opportunityPayload = {
        entrepreneur_id: user?.id,
        name: opportunityData.name,
        description: opportunityData.description,
        amount_sought: opportunityData.amountSought,
        expected_roi: opportunityData.expectedRoi,
        industry: opportunityData.industry,
        status: 'draft' as const,
        location_data_jsonb: {
          location: opportunityData.location,
          team_size: opportunityData.teamSize,
          experience_years: opportunityData.experienceYears
        },
        team_data_jsonb: {
          opportunity_type: opportunityData.opportunityType,
          risk_assessment: opportunityData.riskAssessment,
          milestones: opportunityData.milestones.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            target_date: m.targetDate,
            amount_allocated: m.amountAllocated,
            status: m.status
          })),
          aiInsights: aiInsights
        },
        profitability_data_jsonb: {
          due_diligence_completed: opportunityData.dueDiligenceCompleted
        }
      };

      let error;
      if (id) {
        // Update existing opportunity
        const { error: updateError } = await supabase
          .from('opportunities')
          .update(opportunityPayload)
          .eq('id', id)
          .eq('entrepreneur_id', user?.id);
        error = updateError;
      } else {
        // Create new opportunity
        const { error: insertError } = await supabase
          .from('opportunities')
          .insert(opportunityPayload);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: id ? "Draft updated" : "Draft saved",
        description: id ? "Your opportunity has been updated." : "Your opportunity has been saved as a draft.",
      });

      navigate('/entrepreneur/dashboard');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: "Failed to save opportunity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const publishOpportunity = async () => {
    if (!opportunityData.dueDiligenceCompleted) {
      toast({
        title: "Due diligence required",
        description: "Please complete due diligence before publishing.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      const opportunityPayload = {
        entrepreneur_id: user?.id,
        name: opportunityData.name,
        description: opportunityData.description,
        amount_sought: opportunityData.amountSought,
        expected_roi: opportunityData.expectedRoi,
        industry: opportunityData.industry,
        status: 'pending_review' as const,
        location_data_jsonb: {
          location: opportunityData.location,
          team_size: opportunityData.teamSize,
          experience_years: opportunityData.experienceYears
        },
        team_data_jsonb: {
          opportunity_type: opportunityData.opportunityType,
          risk_assessment: opportunityData.riskAssessment,
          milestones: opportunityData.milestones.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            target_date: m.targetDate,
            amount_allocated: m.amountAllocated,
            status: m.status
          })),
          aiInsights: aiInsights
        },
        profitability_data_jsonb: {
          due_diligence_completed: opportunityData.dueDiligenceCompleted
        }
      };

      let error;
      if (id) {
        // Update existing opportunity
        const { error: updateError } = await supabase
          .from('opportunities')
          .update(opportunityPayload)
          .eq('id', id)
          .eq('entrepreneur_id', user?.id);
        error = updateError;
      } else {
        // Create new opportunity
        const { error: insertError } = await supabase
          .from('opportunities')
          .insert(opportunityPayload);
        error = insertError;
      }

      if (error) throw error;

      // Process DRBE rules
      await drbeService.processRules('opportunity_creation', {
        status: 'pending_review',
        due_diligence_completed: true,
        opportunityId: id || user?.id
      });

      toast({
        title: id ? "Opportunity updated" : "Opportunity published",
        description: id ? "Your opportunity has been updated and submitted for review." : "Your opportunity has been submitted for review.",
      });

      navigate('/entrepreneur/dashboard');
    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: "Publish failed",
        description: "Failed to publish opportunity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const renderFinancialSection = () => (
    <TabsContent value="financial" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Financial Information</span>
          </CardTitle>
          <CardDescription>
            Define the financial aspects of your opportunity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Sought *</Label>
              <div className="flex space-x-2">
                <Input
                  id="amount"
                  type="number"
                  value={opportunityData.amountSought}
                  onChange={(e) => handleInputChange('amountSought', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="flex-1"
                />
                <CurrencySelector
                  value={selectedCurrency}
                  variant="compact"
                  showLabel={false}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roi">Expected ROI (%) *</Label>
              <Input
                id="roi"
                type="number"
                value={opportunityData.expectedRoi}
                onChange={(e) => handleInputChange('expectedRoi', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {opportunityData.amountSought > 0 && opportunityData.expectedRoi > 0 && (
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                Expected return: {formatCurrency(opportunityData.amountSought * (opportunityData.expectedRoi / 100))}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(opportunityData.amountSought)}
              </div>
              <div className="text-sm text-muted-foreground">Amount Sought</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {opportunityData.expectedRoi}%
              </div>
              <div className="text-sm text-muted-foreground">Expected ROI</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(opportunityData.amountSought * (opportunityData.expectedRoi / 100))}
              </div>
              <div className="text-sm text-muted-foreground">Expected Return</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/entrepreneur/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Investment Opportunity</h1>
            <p className="text-muted-foreground">Build your opportunity and attract investors</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Completion</p>
            <p className="text-lg font-semibold">{completionProgress}%</p>
          </div>
          <Progress value={completionProgress} className="w-24" />
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="team">Team & Milestones</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="review">Review & Publish</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Provide the fundamental details about your opportunity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Opportunity Name *</Label>
                  <Input
                    id="name"
                    value={opportunityData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter opportunity name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={opportunityData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Opportunity Type *</Label>
                  <Select value={opportunityData.opportunityType} onValueChange={(value: any) => handleInputChange('opportunityType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="going_concern">Going Concern</SelectItem>
                      <SelectItem value="order_fulfillment">Order Fulfillment</SelectItem>
                      <SelectItem value="project_partnership">Project Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={opportunityData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={opportunityData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your opportunity in detail..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Information Tab */}
        {renderFinancialSection()}

        {/* Team & Milestones Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team Size *</Label>
                  <Input
                    id="teamSize"
                    type="number"
                    value={opportunityData.teamSize}
                    onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={opportunityData.experienceYears}
                    onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Milestones</span>
              </CardTitle>
              <CardDescription>
                Define key milestones and their allocated budgets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {opportunityData.milestones.map((milestone, index) => (
                <div key={milestone.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Milestone {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMilestone(milestone.id)}
                      className="text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={milestone.title}
                        onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                        placeholder="Milestone title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Target Date</Label>
                      <Input
                        type="date"
                        value={milestone.targetDate}
                        onChange={(e) => updateMilestone(milestone.id, 'targetDate', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Amount Allocated (USD)</Label>
                      <Input
                        type="number"
                        value={milestone.amountAllocated}
                        onChange={(e) => updateMilestone(milestone.id, 'amountAllocated', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={milestone.status} onValueChange={(value: any) => updateMilestone(milestone.id, 'status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="skipped">Skipped</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={milestone.description}
                      onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                      placeholder="Describe this milestone..."
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              
              <Button onClick={addMilestone} variant="outline" className="w-full">
                Add Milestone
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Required Documents</span>
              </CardTitle>
              <CardDescription>
                Upload supporting documents for your opportunity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessPlan">Business Plan</Label>
                  <Input
                    id="businessPlan"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload('businessPlan', e.target.files?.[0] || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financialProjections">Financial Projections</Label>
                  <Input
                    id="financialProjections"
                    type="file"
                    accept=".pdf,.xlsx,.xls"
                    onChange={(e) => handleFileUpload('financialProjections', e.target.files?.[0] || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamResumes">Team Resumes</Label>
                  <Input
                    id="teamResumes"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload('teamResumes', e.target.files?.[0] || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marketAnalysis">Market Analysis</Label>
                  <Input
                    id="marketAnalysis"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload('marketAnalysis', e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review & Publish Tab */}
        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Review & Publish</span>
              </CardTitle>
              <CardDescription>
                Review your opportunity and complete due diligence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Due Diligence Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Due Diligence</h3>
                  {opportunityData.dueDiligenceCompleted ? (
                    <Badge variant="default" className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Completed</span>
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>

                {!opportunityData.dueDiligenceCompleted && (
                  <Button
                    onClick={runDueDiligence}
                    disabled={isLoading || completionProgress < 80}
                    className="w-full"
                  >
                    {isLoading ? 'Running AI Analysis...' : 'Run Due Diligence'}
                  </Button>
                )}

                {aiInsights && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Risk Level: {aiInsights.riskAssessment.overallRisk > 70 ? 'High' : aiInsights.riskAssessment.overallRisk > 40 ? 'Medium' : 'Low'}
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Risk Assessment</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{aiInsights.riskAssessment.overallRisk}%</p>
                          <p className="text-xs text-muted-foreground">Overall Risk</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Classification</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm font-medium capitalize">{aiInsights.classification.type.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground">{aiInsights.classification.confidence}% confidence</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Sentiment</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm font-medium">
                            {aiInsights.textAnalysis.sentiment > 0.6 ? 'Positive' : aiInsights.textAnalysis.sentiment < 0.4 ? 'Negative' : 'Neutral'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(aiInsights.textAnalysis.sentiment * 100)}% positive
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={saveAsDraft}
                  disabled={isSaving || completionProgress < 50}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save as Draft'}</span>
                </Button>

                <Button
                  onClick={publishOpportunity}
                  disabled={isPublishing || !opportunityData.dueDiligenceCompleted || completionProgress < 80}
                  className="flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{isPublishing ? 'Publishing...' : 'Publish Opportunity'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
