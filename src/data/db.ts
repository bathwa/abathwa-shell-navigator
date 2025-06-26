
import Dexie, { Table } from 'dexie';

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  profile_data_jsonb?: any;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  entrepreneur_id: string;
  name: string;
  description?: string;
  amount_sought: number;
  expected_roi?: number;
  industry?: string;
  status: string;
  location_data_jsonb?: any;
  team_data_jsonb?: any;
  profitability_data_jsonb?: any;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  opportunity_id: string;
  investor_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface Payment {
  id: string;
  opportunity_id?: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  currency: string;
  payment_type: string;
  status: string;
  transaction_ref?: string;
  payment_method?: string;
  payer_proof_url?: string;
  admin_confirm_at?: string;
  admin_onward_proof_url?: string;
  transaction_fees_jsonb?: any;
  payer_banking_details_jsonb?: any;
  receiver_banking_details_jsonb?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  opportunity_id: string;
  title: string;
  description?: string;
  target_date?: string;
  status: string;
  amount_allocated?: number;
  completion_proof_url?: string;
  payment_status?: string;
  created_at: string;
  updated_at: string;
}

export interface Agreement {
  id: string;
  offer_id: string;
  entrepreneur_id: string;
  investor_id?: string;
  agreement_text?: string;
  terms_jsonb: any;
  entrepreneur_signature_url?: string;
  investor_signature_url?: string;
  admin_signature_url?: string;
  status: string;
  signed_at?: string;
  finalized_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceProvider {
  id: string;
  user_id: string;
  company_name: string;
  service_category: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  portfolio_url?: string;
  is_verified: boolean;
  rating?: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  entrepreneur_id: string;
  title: string;
  description?: string;
  service_category: string;
  assigned_provider_id?: string;
  status: string;
  budget?: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface Remark {
  id: string;
  opportunity_id: string;
  user_id: string;
  remark_text: string;
  remark_type: string;
  parent_remark_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RatingReview {
  id: string;
  reviewer_id: string;
  target_id: string;
  target_type: string;
  rating?: number;
  review_text?: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target_roles?: string[];
  created_by?: string;
  published_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentPool {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  status: string;
  created_by: string;
  current_leader_id?: string;
  election_nomination_start?: string;
  election_nomination_end?: string;
  election_voting_start?: string;
  election_voting_end?: string;
  created_at: string;
  updated_at: string;
}

export class AbathwaDexie extends Dexie {
  profiles!: Table<Profile>;
  opportunities!: Table<Opportunity>;
  offers!: Table<Offer>;
  payments!: Table<Payment>;
  milestones!: Table<Milestone>;
  agreements!: Table<Agreement>;
  service_providers!: Table<ServiceProvider>;
  service_requests!: Table<ServiceRequest>;
  remarks!: Table<Remark>;
  ratings_reviews!: Table<RatingReview>;
  announcements!: Table<Announcement>;
  investment_pools!: Table<InvestmentPool>;

  constructor() {
    super('AbathwaCapitalDB');
    this.version(2).stores({
      profiles: 'id,role',
      opportunities: 'id,entrepreneur_id,status',
      offers: 'id,opportunity_id,investor_id',
      payments: 'id,opportunity_id,sender_id,receiver_id,status',
      milestones: 'id,opportunity_id,status',
      agreements: 'id,offer_id,entrepreneur_id,investor_id,status',
      service_providers: 'id,user_id,service_category',
      service_requests: 'id,entrepreneur_id,assigned_provider_id,status',
      remarks: 'id,opportunity_id,user_id',
      ratings_reviews: 'id,reviewer_id,target_id,target_type',
      announcements: 'id,created_by',
      investment_pools: 'id,created_by,status',
    });
  }
}

export const db = new AbathwaDexie();
