
import { create } from 'zustand';
import { db, Profile, Opportunity, Offer } from '../data/db';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type OpportunityStatus = Database['public']['Enums']['opportunity_status'];
type OfferStatus = Database['public']['Enums']['offer_status'];

interface DataState {
  profiles: Profile[];
  opportunities: Opportunity[];
  offers: Offer[];
  loading: boolean;
  lastSync: number | null;
  fetchData: (table: 'profiles' | 'opportunities' | 'offers') => Promise<void>;
  syncAllData: () => Promise<void>;
  addOpportunity: (opportunity: Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'status'>) => Promise<void>;
  updateOpportunityStatus: (id: string, status: OpportunityStatus) => Promise<void>;
  addOffer: (offer: Omit<Offer, 'id' | 'created_at'>) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  profiles: [],
  opportunities: [],
  offers: [],
  loading: false,
  lastSync: null,

  fetchData: async (table) => {
    set({ loading: true });
    try {
      // 1. Try to load from IndexedDB first for offline-first experience
      const cachedData = await db.table(table).toArray();
      if (cachedData.length > 0) {
        set({ [table]: cachedData });
      }

      // 2. Fetch from Supabase (always try to sync latest)
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;

      // 3. Update IndexedDB and Zustand store with latest data
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
    await get().fetchData('profiles');
    await get().fetchData('opportunities');
    await get().fetchData('offers');
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
      const { data, error } = await supabase.from('offers').insert([offerData]).select();
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
}));
