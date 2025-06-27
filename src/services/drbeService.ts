import { supabase } from '@/integrations/supabase/client';
import { aiService } from './aiService';

export interface DRBERule {
  id: string;
  name: string;
  description: string;
  condition: (data: any) => boolean;
  action: (data: any) => Promise<void>;
  priority: number;
}

export interface MilestoneSkipAlert {
  opportunityId: string;
  milestoneId: string;
  skipReason: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  timestamp: Date;
}

export interface PaymentFlowState {
  status: 'initiated' | 'pending_proof' | 'admin_review' | 'onward_transfer_pending' | 'completed' | 'failed';
  currentStep: string;
  nextAction: string;
  requiredDocuments: string[];
  estimatedCompletion: Date;
}

class DRBEService {
  private rules: DRBERule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    // Opportunity Rules
    this.rules.push({
      id: 'opportunity_due_diligence_required',
      name: 'Due Diligence Required',
      description: 'All opportunities must have due diligence completed before publishing',
      condition: (data) => data.status === 'pending_review' && !data.due_diligence_completed,
      action: async (data) => {
        await this.triggerDueDiligence(data.opportunityId);
      },
      priority: 1
    });

    // Milestone Rules
    this.rules.push({
      id: 'milestone_skip_alert',
      name: 'Milestone Skip Alert',
      description: 'Alert when milestones are skipped',
      condition: (data) => data.status === 'skipped',
      action: async (data) => {
        await this.handleMilestoneSkip(data);
      },
      priority: 2
    });

    // Payment Rules
    this.rules.push({
      id: 'payment_verification_required',
      name: 'Payment Verification Required',
      description: 'All payments require admin verification',
      condition: (data) => data.status === 'pending_proof' && data.payer_proof_url,
      action: async (data) => {
        await this.notifyAdminPaymentVerification(data);
      },
      priority: 1
    });

    // Agreement Rules
    this.rules.push({
      id: 'agreement_signing_sequence',
      name: 'Agreement Signing Sequence',
      description: 'Enforce proper signing sequence for agreements',
      condition: (data) => data.status === 'draft' && data.entrepreneur_signature_url && !data.investor_signature_url,
      action: async (data) => {
        await this.notifyInvestorToSign(data);
      },
      priority: 1
    });

    // Risk Assessment Rules
    this.rules.push({
      id: 'high_risk_opportunity_alert',
      name: 'High Risk Opportunity Alert',
      description: 'Alert admins for high-risk opportunities',
      condition: (data) => data.risk_score > 80,
      action: async (data) => {
        await this.alertAdminHighRisk(data);
      },
      priority: 1
    });

    // Service Provider Rules
    this.rules.push({
      id: 'service_provider_assignment',
      name: 'Service Provider Assignment',
      description: 'Auto-assign service providers based on category',
      condition: (data) => data.status === 'published' && !data.assigned_provider_id,
      action: async (data) => {
        await this.autoAssignServiceProvider(data);
      },
      priority: 3
    });
  }

  async processRules(context: string, data: any): Promise<void> {
    const applicableRules = this.rules
      .filter(rule => rule.condition(data))
      .sort((a, b) => b.priority - a.priority);

    for (const rule of applicableRules) {
      try {
        await rule.action(data);
        await this.logRuleExecution(rule.id, context, data);
      } catch (error) {
        console.error(`Rule execution failed for ${rule.id}:`, error);
        await this.logRuleError(rule.id, context, data, error);
      }
    }
  }

  async handleMilestoneSkip(milestoneData: any): Promise<void> {
    const alert: MilestoneSkipAlert = {
      opportunityId: milestoneData.opportunity_id,
      milestoneId: milestoneData.id,
      skipReason: milestoneData.skip_reason || 'No reason provided',
      riskLevel: this.calculateSkipRiskLevel(milestoneData),
      recommendations: this.generateSkipRecommendations(milestoneData),
      timestamp: new Date()
    };

    // Store alert in database using 'create' action type
    await supabase.from('audit_log').insert({
      action_type: 'create',
      resource_type: 'milestone',
      resource_id: milestoneData.id,
      details_jsonb: alert as any
    });

    // Notify relevant parties
    await this.notifyMilestoneSkip(alert);
  }

  private calculateSkipRiskLevel(milestoneData: any): 'low' | 'medium' | 'high' {
    const skipCount = milestoneData.total_skipped_milestones || 0;
    const opportunityValue = milestoneData.opportunity_value || 0;

    if (skipCount > 3 || opportunityValue > 1000000) return 'high';
    if (skipCount > 1 || opportunityValue > 500000) return 'medium';
    return 'low';
  }

  private generateSkipRecommendations(milestoneData: any): string[] {
    const recommendations = [];
    
    if (milestoneData.total_skipped_milestones > 2) {
      recommendations.push('Consider restructuring project timeline');
      recommendations.push('Review project management approach');
    }
    
    if (milestoneData.opportunity_value > 500000) {
      recommendations.push('Schedule emergency investor meeting');
      recommendations.push('Prepare detailed risk mitigation plan');
    }

    return recommendations;
  }

  async triggerDueDiligence(opportunityId: string): Promise<void> {
    // Get opportunity data
    const { data: opportunity } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();

    if (!opportunity) return;

    // Trigger AI risk assessment
    const riskAssessment = await aiService.assessRisk(opportunity);
    
    // Store risk assessment in team_data_jsonb
    await supabase.from('opportunities').update({
      team_data_jsonb: { risk_assessment: riskAssessment as any }
    }).eq('id', opportunityId);

    // Notify admins if high risk
    if (riskAssessment.overallRisk > 70) {
      await this.alertAdminHighRisk({
        opportunityId,
        riskAssessment,
        opportunity
      });
    }
  }

  async notifyAdminPaymentVerification(paymentData: any): Promise<void> {
    // Create notification for admin using 'create' action type
    await supabase.from('audit_log').insert({
      action_type: 'create',
      resource_type: 'payment',
      resource_id: paymentData.id,
      details_jsonb: {
        payment_id: paymentData.id,
        amount: paymentData.amount,
        sender: paymentData.sender_id,
        receiver: paymentData.receiver_id,
        proof_url: paymentData.payer_proof_url,
        message: 'Payment verification required'
      }
    });
  }

  async notifyInvestorToSign(agreementData: any): Promise<void> {
    // Update agreement status
    await supabase.from('agreements').update({
      status: 'entrepreneur_signed'
    }).eq('id', agreementData.id);

    // Notify investor using 'create' action type
    await supabase.from('audit_log').insert({
      action_type: 'create',
      resource_type: 'agreement',
      resource_id: agreementData.id,
      details_jsonb: {
        agreement_id: agreementData.id,
        investor_id: agreementData.investor_id,
        message: 'Entrepreneur has signed. Please review and sign the agreement.'
      }
    });
  }

  async alertAdminHighRisk(data: any): Promise<void> {
    await supabase.from('audit_log').insert({
      action_type: 'create',
      resource_type: 'opportunity',
      resource_id: data.opportunityId || data.id,
      details_jsonb: {
        risk_score: data.riskAssessment?.overallRisk || data.risk_score,
        risk_factors: data.riskAssessment?.riskFactors || [],
        recommendations: data.riskAssessment?.recommendations || [],
        message: 'High risk opportunity detected'
      }
    });
  }

  async autoAssignServiceProvider(requestData: any): Promise<void> {
    // Find available service providers in the category
    const { data: providers } = await supabase
      .from('service_providers')
      .select('*')
      .eq('service_category', requestData.service_category)
      .eq('is_verified', true)
      .order('rating', { ascending: false })
      .limit(1);

    if (providers && providers.length > 0) {
      await supabase.from('service_requests').update({
        assigned_provider_id: providers[0].id,
        status: 'assigned'
      }).eq('id', requestData.id);
    }
  }

  async notifyMilestoneSkip(alert: MilestoneSkipAlert): Promise<void> {
    // Notify investors
    const { data: investors } = await supabase
      .from('offers')
      .select('investor_id')
      .eq('opportunity_id', alert.opportunityId)
      .eq('status', 'accepted');

    if (investors) {
      for (const investor of investors) {
        await supabase.from('audit_log').insert({
          action_type: 'create',
          resource_type: 'milestone',
          resource_id: alert.milestoneId,
          user_id: investor.investor_id,
          details_jsonb: alert as any
        });
      }
    }
  }

  async validatePaymentFlow(paymentData: any): Promise<PaymentFlowState> {
    const state: PaymentFlowState = {
      status: paymentData.status,
      currentStep: this.getCurrentPaymentStep(paymentData.status),
      nextAction: this.getNextPaymentAction(paymentData.status),
      requiredDocuments: this.getRequiredDocuments(paymentData.status),
      estimatedCompletion: this.getEstimatedCompletion(paymentData.status)
    };

    return state;
  }

  private getCurrentPaymentStep(status: string): string {
    const steps = {
      'initiated': 'Payment Request Created',
      'pending_proof': 'Awaiting Payment Proof',
      'admin_review': 'Admin Reviewing Payment',
      'onward_transfer_pending': 'Preparing Onward Transfer',
      'completed': 'Payment Completed',
      'failed': 'Payment Failed'
    };
    return steps[status as keyof typeof steps] || 'Unknown';
  }

  private getNextPaymentAction(status: string): string {
    const actions = {
      'initiated': 'Upload payment proof',
      'pending_proof': 'Admin will review payment',
      'admin_review': 'Admin will confirm and process',
      'onward_transfer_pending': 'Admin will complete transfer',
      'completed': 'Payment finalized',
      'failed': 'Contact support'
    };
    return actions[status as keyof typeof actions] || 'Unknown';
  }

  private getRequiredDocuments(status: string): string[] {
    const documents = {
      'initiated': ['Bank transfer receipt', 'Reference number'],
      'pending_proof': ['Payment proof', 'Bank statement'],
      'admin_review': [],
      'onward_transfer_pending': ['Receiver banking details'],
      'completed': [],
      'failed': ['Error details', 'Support ticket']
    };
    return documents[status as keyof typeof documents] || [];
  }

  private getEstimatedCompletion(status: string): Date {
    const now = new Date();
    const estimates = {
      'initiated': new Date(now.getTime() + 24 * 60 * 60 * 1000), // 1 day
      'pending_proof': new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours
      'admin_review': new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours
      'onward_transfer_pending': new Date(now.getTime() + 24 * 60 * 60 * 1000), // 1 day
      'completed': now,
      'failed': new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 1 week
    };
    return estimates[status as keyof typeof estimates] || now;
  }

  async validateOpportunityCompletion(opportunityData: any): Promise<boolean> {
    const requiredFields = [
      'name', 'description', 'amount_sought', 'expected_roi', 'industry'
    ];

    const missingFields = requiredFields.filter(field => !opportunityData[field]);
    
    if (missingFields.length > 0) {
      await this.logValidationError('opportunity', missingFields, opportunityData);
      return false;
    }

    return true;
  }

  async validateAgreementCompletion(agreementData: any): Promise<boolean> {
    // Check if all required signatures are present
    const requiredSignatures = ['entrepreneur_signature_url', 'investor_signature_url'];
    const missingSignatures = requiredSignatures.filter(sig => !agreementData[sig]);

    if (missingSignatures.length > 0) {
      await this.logValidationError('agreement', missingSignatures, agreementData);
      return false;
    }

    return true;
  }

  private async logRuleExecution(ruleId: string, context: string, data: any): Promise<void> {
    await supabase.from('audit_log').insert({
      action_type: 'create',
      resource_type: 'drbe',
      details_jsonb: {
        rule_id: ruleId,
        context,
        data: JSON.stringify(data),
        timestamp: new Date().toISOString()
      }
    });
  }

  private async logRuleError(ruleId: string, context: string, data: any, error: any): Promise<void> {
    await supabase.from('audit_log').insert({
      action_type: 'create',
      resource_type: 'drbe',
      details_jsonb: {
        rule_id: ruleId,
        context,
        data: JSON.stringify(data),
        error: error.message,
        timestamp: new Date().toISOString(),
        type: 'error'
      }
    });
  }

  private async logValidationError(type: string, missingFields: string[], data: any): Promise<void> {
    await supabase.from('audit_log').insert({
      action_type: 'create',
      resource_type: type,
      details_jsonb: {
        missing_fields: missingFields,
        data: JSON.stringify(data),
        timestamp: new Date().toISOString(),
        type: 'validation_error'
      }
    });
  }
}

export const drbeService = new DRBEService(); 