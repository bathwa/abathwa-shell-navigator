
import Dexie, { Table } from 'dexie';

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
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

export class AbathwaDexie extends Dexie {
  profiles!: Table<Profile>;
  opportunities!: Table<Opportunity>;
  offers!: Table<Offer>;

  constructor() {
    super('AbathwaCapitalDB');
    this.version(1).stores({
      profiles: 'id,role',
      opportunities: 'id,entrepreneur_id,status',
      offers: 'id,opportunity_id,investor_id',
    });
  }
}

export const db = new AbathwaDexie();
