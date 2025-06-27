import * as tf from '@tensorflow/tfjs';

export interface RiskAssessment {
  overallRisk: number; // 0-100
  financialRisk: number;
  operationalRisk: number;
  marketRisk: number;
  complianceRisk: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface DueDiligenceInsights {
  summary: string;
  keyMetrics: Record<string, number>;
  riskAssessment: RiskAssessment;
  aiConfidence: number;
  dataQuality: number;
}

export interface OpportunityClassification {
  type: 'going_concern' | 'order_fulfillment' | 'project_partnership';
  confidence: number;
  features: Record<string, number>;
}

class AIService {
  private models: {
    riskAssessment?: tf.LayersModel;
    opportunityClassification?: tf.LayersModel;
    textAnalysis?: tf.LayersModel;
  } = {};

  async initialize() {
    try {
      // Initialize TensorFlow.js backend
      await tf.setBackend('webgl');
      console.log('TensorFlow.js initialized with backend:', tf.getBackend());
      
      // Load pre-trained models (in production, these would be hosted)
      await this.loadModels();
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
    }
  }

  private async loadModels() {
    try {
      // In a real implementation, these would be loaded from your model hosting service
      // For now, we'll create simple models for demonstration
      this.models.riskAssessment = this.createRiskAssessmentModel();
      this.models.opportunityClassification = this.createOpportunityClassificationModel();
      this.models.textAnalysis = this.createTextAnalysisModel();
    } catch (error) {
      console.error('Failed to load AI models:', error);
    }
  }

  private createRiskAssessmentModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [20], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 5, activation: 'sigmoid' }) // 5 risk categories
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private createOpportunityClassificationModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [15], units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 3, activation: 'softmax' }) // 3 opportunity types
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private createTextAnalysisModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [100], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }) // Sentiment/toxicity score
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async assessRisk(opportunityData: any): Promise<RiskAssessment> {
    try {
      if (!this.models.riskAssessment) {
        throw new Error('Risk assessment model not loaded');
      }

      // Extract features from opportunity data
      const features = this.extractRiskFeatures(opportunityData);
      const inputTensor = tf.tensor2d([features], [1, 20]);

      // Make prediction
      const prediction = this.models.riskAssessment.predict(inputTensor) as tf.Tensor;
      const riskScores = await prediction.array() as number[][];

      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();

      const scores = riskScores[0];
      
      return {
        overallRisk: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100),
        financialRisk: Math.round(scores[0] * 100),
        operationalRisk: Math.round(scores[1] * 100),
        marketRisk: Math.round(scores[2] * 100),
        complianceRisk: Math.round(scores[3] * 100),
        riskFactors: this.identifyRiskFactors(opportunityData, scores),
        recommendations: this.generateRecommendations(scores)
      };
    } catch (error) {
      console.error('Risk assessment failed:', error);
      return this.getDefaultRiskAssessment();
    }
  }

  async classifyOpportunity(opportunityData: any): Promise<OpportunityClassification> {
    try {
      if (!this.models.opportunityClassification) {
        throw new Error('Opportunity classification model not loaded');
      }

      const features = this.extractOpportunityFeatures(opportunityData);
      const inputTensor = tf.tensor2d([features], [1, 15]);

      const prediction = this.models.opportunityClassification.predict(inputTensor) as tf.Tensor;
      const scores = await prediction.array() as number[][];

      inputTensor.dispose();
      prediction.dispose();

      const typeIndex = scores[0].indexOf(Math.max(...scores[0]));
      const types = ['going_concern', 'order_fulfillment', 'project_partnership'];

      return {
        type: types[typeIndex] as any,
        confidence: Math.round(scores[0][typeIndex] * 100),
        features: this.extractFeatureImportance(features)
      };
    } catch (error) {
      console.error('Opportunity classification failed:', error);
      return {
        type: 'going_concern',
        confidence: 50,
        features: {}
      };
    }
  }

  async analyzeText(text: string): Promise<{ sentiment: number; toxicity: number; keyTopics: string[] }> {
    try {
      if (!this.models.textAnalysis) {
        throw new Error('Text analysis model not loaded');
      }

      // Simple text preprocessing (in production, use proper NLP)
      const features = this.textToFeatures(text);
      const inputTensor = tf.tensor2d([features], [1, 100]);

      const prediction = this.models.textAnalysis.predict(inputTensor) as tf.Tensor;
      const score = await prediction.array() as number[][];

      inputTensor.dispose();
      prediction.dispose();

      return {
        sentiment: score[0][0],
        toxicity: score[0][0] > 0.7 ? score[0][0] : 0,
        keyTopics: this.extractTopics(text)
      };
    } catch (error) {
      console.error('Text analysis failed:', error);
      return {
        sentiment: 0.5,
        toxicity: 0,
        keyTopics: []
      };
    }
  }

  private extractRiskFeatures(data: any): number[] {
    // Extract 20 risk-related features from opportunity data
    return [
      data.amount_sought / 1000000 || 0, // Normalized amount
      data.expected_roi / 100 || 0, // Normalized ROI
      data.team_size || 0,
      data.experience_years || 0,
      data.debt_ratio || 0,
      data.cash_flow_stability || 0,
      data.market_competition || 0,
      data.regulatory_compliance || 0,
      data.technology_readiness || 0,
      data.customer_validation || 0,
      data.intellectual_property || 0,
      data.supply_chain_risk || 0,
      data.geographic_risk || 0,
      data.currency_risk || 0,
      data.political_risk || 0,
      data.environmental_risk || 0,
      data.legal_risk || 0,
      data.operational_risk || 0,
      data.financial_risk || 0,
      data.strategic_risk || 0
    ];
  }

  private extractOpportunityFeatures(data: any): number[] {
    // Extract 15 features for opportunity classification
    return [
      data.investment_horizon || 0,
      data.capital_intensity || 0,
      data.operational_complexity || 0,
      data.market_maturity || 0,
      data.technology_dependency || 0,
      data.regulatory_requirements || 0,
      data.customer_concentration || 0,
      data.supplier_dependency || 0,
      data.intellectual_property_value || 0,
      data.scalability_potential || 0,
      data.cash_flow_timing || 0,
      data.exit_strategy_clarity || 0,
      data.team_experience || 0,
      data.market_size || 0,
      data.competitive_advantage || 0
    ];
  }

  private textToFeatures(text: string): number[] {
    // Simple text feature extraction (in production, use proper NLP)
    const features = new Array(100).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach((word, index) => {
      if (index < 100) {
        features[index] = word.length / 10; // Simple feature
      }
    });
    
    return features;
  }

  private identifyRiskFactors(data: any, scores: number[]): string[] {
    const factors = [];
    
    if (scores[0] > 0.7) factors.push('High financial risk');
    if (scores[1] > 0.7) factors.push('Operational challenges');
    if (scores[2] > 0.7) factors.push('Market volatility');
    if (scores[3] > 0.7) factors.push('Compliance issues');
    
    if (data.debt_ratio > 0.8) factors.push('High debt burden');
    if (data.team_size < 3) factors.push('Small team size');
    if (data.experience_years < 2) factors.push('Limited experience');
    
    return factors;
  }

  private generateRecommendations(scores: number[]): string[] {
    const recommendations = [];
    
    if (scores[0] > 0.6) recommendations.push('Strengthen financial planning and cash flow management');
    if (scores[1] > 0.6) recommendations.push('Improve operational processes and team structure');
    if (scores[2] > 0.6) recommendations.push('Conduct thorough market analysis and competitive positioning');
    if (scores[3] > 0.6) recommendations.push('Ensure regulatory compliance and legal review');
    
    return recommendations;
  }

  private extractFeatureImportance(features: number[]): Record<string, number> {
    const featureNames = [
      'investment_horizon', 'capital_intensity', 'operational_complexity',
      'market_maturity', 'technology_dependency', 'regulatory_requirements',
      'customer_concentration', 'supplier_dependency', 'intellectual_property_value',
      'scalability_potential', 'cash_flow_timing', 'exit_strategy_clarity',
      'team_experience', 'market_size', 'competitive_advantage'
    ];
    
    const importance: Record<string, number> = {};
    featureNames.forEach((name, index) => {
      importance[name] = features[index] || 0;
    });
    
    return importance;
  }

  private extractTopics(text: string): string[] {
    // Simple topic extraction (in production, use proper NLP)
    const topics = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('technology') || lowerText.includes('software')) topics.push('Technology');
    if (lowerText.includes('finance') || lowerText.includes('investment')) topics.push('Finance');
    if (lowerText.includes('health') || lowerText.includes('medical')) topics.push('Healthcare');
    if (lowerText.includes('education') || lowerText.includes('learning')) topics.push('Education');
    if (lowerText.includes('retail') || lowerText.includes('ecommerce')) topics.push('Retail');
    
    return topics;
  }

  private getDefaultRiskAssessment(): RiskAssessment {
    return {
      overallRisk: 50,
      financialRisk: 50,
      operationalRisk: 50,
      marketRisk: 50,
      complianceRisk: 50,
      riskFactors: ['Insufficient data for assessment'],
      recommendations: ['Provide more detailed information for accurate risk assessment']
    };
  }
}

export const aiService = new AIService(); 