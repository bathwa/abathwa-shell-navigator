
import { create } from 'zustand';
import { db, Profile, Opportunity, Offer, Payment, Milestone, Agreement, ServiceProvider, ServiceRequest, Remark, RatingReview, Announcement, InvestmentPool, PoolDiscussion, PoolObjective, PoolReport, PoolInvestment } from '../data/db';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type OpportunityStatus = Database['public']['Enums']['opportunity_status'];
type OfferStatus = Database['public']['Enums']['offer_status'];
type PaymentStatus = Database['public']['Enums']['payment_status'];
type MilestoneStatus = Database['public']['Enums']['milestone_status'];
type AgreementStatus = Database['public']['Enums']['agreement_status'];
type ServiceRequestStatus = Database['public']['Enums']['service_request_status'];

type OfferInsert = Database['public']['Tables']['offers']['Insert'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type MilestoneInsert = Database['public']['Tables']['milestones']['Insert'];
type AgreementInsert = Database['public']['Tables']['agreements']['Insert'];

const validTableNames = [
  'profiles',
  'opportunities', 
  'offers',
  'payments',
  'milestones',
  'agreements',
  'service_providers',
  'service_requests',
  'remarks',
  'ratings_reviews',
  'announcements',
  'investment_pools',
  'pool_discussions',
  'pool_objectives',
  'pool_reports',
  'pool_investments'
];

interface DataState {
  profiles: Profile[];
  opportunities: Opportunity[];
  offers: Offer[];
  payments: Payment[];
  milestones: Milestone[];
  agreements: Agreement[];
  serviceProviders: ServiceProvider[];
  serviceRequests: ServiceRequest[];
  remarks: Remark[];
  ratingsReviews: RatingReview[];
  announcements: Announcement[];
  investmentPools: InvestmentPool[];
  poolDiscussions: PoolDiscussion[];
  poolObjectives: PoolObjective[];
  poolReports: PoolReport[];
  poolInvestments: PoolInvestment[];
  loading: boolean;
  lastSync: number | null;
  fetchData: (table: string) => Promise<void>;
  syncAllData: () => Promise<void>;
  addOpportunity: (opportunity: Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'status'>) => Promise<void>;
  updateOpportunityStatus: (id: string, status: OpportunityStatus) => Promise<void>;
  addOffer: (offer: Omit<OfferInsert, 'id' | 'created_at'>) => Promise<void>;
  addPayment: (payment: Omit<PaymentInsert, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addMilestone: (milestone: Omit<MilestoneInsert, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMilestoneStatus: (id: string, status: MilestoneStatus) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  profiles: [],
  opportunities: [],
  offers: [],
  payments: [],
  milestones: [],
  agreements: [],
  serviceProviders: [],
  serviceRequests: [],
  remarks: [],
  ratingsReviews: [],
  announcements: [],
  investmentPools: [],
  poolDiscussions: [],
  poolObjectives: [],
  poolReports: [],
  poolInvestments: [],
  loading: false,
  lastSync: null,

  fetchData: async (table) => {
    if (!validTableNames.includes(table)) {
      console.warn(`Invalid table name: ${table}`);
      return;
    }
    
    set({ loading: true });
    try {
      const cachedData = await db.table(table).toArray();
      if (cachedData.length > 0) {
        set({ [table]: cachedData });
      }

      const { data, error } = await supabase.from(table as any).select('*');
      if (error) throw error;

      if (data) {
        await db.table(table).clear();
        await db.table(table).bulkAdd(data);
        set({ [table]: data, lastSync: Date.now() });
      }
    } catch (error) {
      console.error(`Failed to fetch and sync ${table}:`, error);
    } finally {
      set({ loading: false });
    }
  },

  syncAllData: async () => {
    const tables = [
      'profiles',
      'opportunities',
      'offers',
      'payments',
      'milestones',
      'agreements',
      'service_providers',
      'service_requests',
      'remarks',
      'ratings_reviews',
      'announcements',
      'investment_pools',
      'pool_discussions',
      'pool_objectives',
      'pool_reports',
      'pool_investments'
    ];

    for (const table of tables) {
      await get().fetchData(table);
    }
  },

  addOpportunity: async (opportunityData) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from('opportunities').insert([opportunityData]).select();
      if (error) throw error;
      if (data && data.length > 0) {
        const newOpp = data[0] as Opportunity;
        await db.opportunities.add(newOpp);
        set((state) => ({ opportunities: [...state.opportunities, newOpp] }));
      }
    } catch (error) {
      console.error('Error adding opportunity:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateOpportunityStatus: async (id, status) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from('opportunities').update({ status }).eq('id', id).select();
      if (error) throw error;
      if (data && data.length > 0) {
        const updatedOpp = data[0] as Opportunity;
        await db.opportunities.put(updatedOpp);
        set((state) => ({
          opportunities: state.opportunities.map((opp) =>
            opp.id === id ? updatedOpp : opp
          ),
        }));
      }
    } catch (error) {
      console.error('Error updating opportunity status:', error);
    } finally {
      set({ loading: false });
    }
  },

  addOffer: async (offerData) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from('offers').insert(offerData).select();
      if (error) throw error;
      if (data && data.length > 0) {
        const newOffer = data[0] as Offer;
        await db.offers.add(newOffer);
        set((state) => ({ offers: [...state.offers, newOffer] }));
      }
    } catch (error) {
      console.error('Error adding offer:', error);
    } finally {
      set({ loading: false });
    }
  },

  addPayment: async (paymentData) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from('payments').insert(paymentData).select();
      if (error) throw error;
      if (data && data.length > 0) {
        const newPayment = data[0] as Payment;
        await db.payments.add(newPayment);
        set((state) => ({ payments: [...state.payments, newPayment] }));
      }
    } catch (error) {
      console.error('Error adding payment:', error);
    } finally {
      set({ loading: false });
    }
  },

  addMilestone: async (milestoneData) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from('milestones').insert(milestoneData).select();
      if (error) throw error;
      if (data && data.length > 0) {
        const newMilestone = data[0] as Milestone;
        await db.milestones.add(newMilestone);
        set((state) => ({ milestones: [...state.milestones, newMilestone] }));
      }
    } catch (error) {
      console.error('Error adding milestone:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateMilestoneStatus: async (id, status) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from('milestones').update({ status }).eq('id', id).select();
      if (error) throw error;
      if (data && data.length > 0) {
        const updatedMilestone = data[0] as Milestone;
        await db.milestones.put(updatedMilestone);
        set((state) => ({
          milestones: state.milestones.map((milestone) =>
            milestone.id === id ? updatedMilestone : milestone
          ),
        }));
      }
    } catch (error) {
      console.error('Error updating milestone status:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
