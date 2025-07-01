export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agreements: {
        Row: {
          admin_signature_url: string | null
          agreement_text: string | null
          created_at: string | null
          entrepreneur_id: string
          entrepreneur_signature_url: string | null
          finalized_at: string | null
          id: string
          investor_id: string | null
          investor_signature_url: string | null
          offer_id: string
          signed_at: string | null
          status: Database["public"]["Enums"]["agreement_status"] | null
          terms_jsonb: Json
          updated_at: string | null
        }
        Insert: {
          admin_signature_url?: string | null
          agreement_text?: string | null
          created_at?: string | null
          entrepreneur_id: string
          entrepreneur_signature_url?: string | null
          finalized_at?: string | null
          id?: string
          investor_id?: string | null
          investor_signature_url?: string | null
          offer_id: string
          signed_at?: string | null
          status?: Database["public"]["Enums"]["agreement_status"] | null
          terms_jsonb: Json
          updated_at?: string | null
        }
        Update: {
          admin_signature_url?: string | null
          agreement_text?: string | null
          created_at?: string | null
          entrepreneur_id?: string
          entrepreneur_signature_url?: string | null
          finalized_at?: string | null
          id?: string
          investor_id?: string | null
          investor_signature_url?: string | null
          offer_id?: string
          signed_at?: string | null
          status?: Database["public"]["Enums"]["agreement_status"] | null
          terms_jsonb?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreements_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: true
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          published_at: string | null
          target_roles: Database["public"]["Enums"]["app_role"][] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          published_at?: string | null
          target_roles?: Database["public"]["Enums"]["app_role"][] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          published_at?: string | null
          target_roles?: Database["public"]["Enums"]["app_role"][] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action_type: Database["public"]["Enums"]["audit_action_type"]
          details_jsonb: Json | null
          event_time: string | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["audit_action_type"]
          details_jsonb?: Json | null
          event_time?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["audit_action_type"]
          details_jsonb?: Json | null
          event_time?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      escrow_accounts: {
        Row: {
          account_holder_id: string
          balance: number
          created_at: string | null
          currency: string
          id: string
          opportunity_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          account_holder_id: string
          balance?: number
          created_at?: string | null
          currency?: string
          id?: string
          opportunity_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          account_holder_id?: string
          balance?: number
          created_at?: string | null
          currency?: string
          id?: string
          opportunity_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_accounts_account_holder_id_fkey"
            columns: ["account_holder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_accounts_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_pools: {
        Row: {
          created_at: string | null
          created_by: string
          current_amount: number
          current_leader_id: string | null
          description: string | null
          election_nomination_end: string | null
          election_nomination_start: string | null
          election_voting_end: string | null
          election_voting_start: string | null
          id: string
          name: string
          status: string | null
          target_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_amount?: number
          current_leader_id?: string | null
          description?: string | null
          election_nomination_end?: string | null
          election_nomination_start?: string | null
          election_voting_end?: string | null
          election_voting_start?: string | null
          id?: string
          name: string
          status?: string | null
          target_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_amount?: number
          current_leader_id?: string | null
          description?: string | null
          election_nomination_end?: string | null
          election_nomination_start?: string | null
          election_voting_end?: string | null
          election_voting_start?: string | null
          id?: string
          name?: string
          status?: string | null
          target_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_pools_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_pools_current_leader_id_fkey"
            columns: ["current_leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          amount_allocated: number | null
          completion_proof_url: string | null
          created_at: string | null
          description: string | null
          id: string
          opportunity_id: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          status: Database["public"]["Enums"]["milestone_status"] | null
          target_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount_allocated?: number | null
          completion_proof_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          opportunity_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          status?: Database["public"]["Enums"]["milestone_status"] | null
          target_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount_allocated?: number | null
          completion_proof_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          opportunity_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          status?: Database["public"]["Enums"]["milestone_status"] | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          investor_id: string
          opportunity_id: string
          status: Database["public"]["Enums"]["offer_status"] | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          investor_id: string
          opportunity_id: string
          status?: Database["public"]["Enums"]["offer_status"] | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          investor_id?: string
          opportunity_id?: string
          status?: Database["public"]["Enums"]["offer_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          amount_sought: number
          created_at: string | null
          description: string | null
          entrepreneur_id: string
          expected_roi: number | null
          id: string
          industry: string | null
          location_data_jsonb: Json | null
          name: string
          profitability_data_jsonb: Json | null
          status: Database["public"]["Enums"]["opportunity_status"] | null
          team_data_jsonb: Json | null
          updated_at: string | null
        }
        Insert: {
          amount_sought: number
          created_at?: string | null
          description?: string | null
          entrepreneur_id: string
          expected_roi?: number | null
          id?: string
          industry?: string | null
          location_data_jsonb?: Json | null
          name: string
          profitability_data_jsonb?: Json | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          team_data_jsonb?: Json | null
          updated_at?: string | null
        }
        Update: {
          amount_sought?: number
          created_at?: string | null
          description?: string | null
          entrepreneur_id?: string
          expected_roi?: number | null
          id?: string
          industry?: string | null
          location_data_jsonb?: Json | null
          name?: string
          profitability_data_jsonb?: Json | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          team_data_jsonb?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          admin_confirm_at: string | null
          admin_onward_proof_url: string | null
          amount: number
          created_at: string | null
          currency: string
          id: string
          notes: string | null
          opportunity_id: string | null
          payer_banking_details_jsonb: Json | null
          payer_proof_url: string | null
          payment_method: string | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          receiver_banking_details_jsonb: Json | null
          receiver_id: string
          sender_id: string
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_fees_jsonb: Json | null
          transaction_ref: string | null
          updated_at: string | null
        }
        Insert: {
          admin_confirm_at?: string | null
          admin_onward_proof_url?: string | null
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          payer_banking_details_jsonb?: Json | null
          payer_proof_url?: string | null
          payment_method?: string | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          receiver_banking_details_jsonb?: Json | null
          receiver_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_fees_jsonb?: Json | null
          transaction_ref?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_confirm_at?: string | null
          admin_onward_proof_url?: string | null
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          payer_banking_details_jsonb?: Json | null
          payer_proof_url?: string | null
          payment_method?: string | null
          payment_type?: Database["public"]["Enums"]["payment_type"]
          receiver_banking_details_jsonb?: Json | null
          receiver_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_fees_jsonb?: Json | null
          transaction_ref?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_discussions: {
        Row: {
          closed_at: string | null
          content: string
          created_at: string | null
          created_by: string
          id: string
          pool_id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          closed_at?: string | null
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          pool_id: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          closed_at?: string | null
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          pool_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_discussions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_discussions_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "investment_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_investments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          opportunity_id: string
          pool_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          opportunity_id: string
          pool_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          opportunity_id?: string
          pool_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_investments_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_investments_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "investment_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_members: {
        Row: {
          id: string
          investment_contribution: number | null
          is_active: boolean | null
          joined_at: string | null
          member_id: string
          pool_id: string
        }
        Insert: {
          id?: string
          investment_contribution?: number | null
          is_active?: boolean | null
          joined_at?: string | null
          member_id: string
          pool_id: string
        }
        Update: {
          id?: string
          investment_contribution?: number | null
          is_active?: boolean | null
          joined_at?: string | null
          member_id?: string
          pool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_members_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "investment_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_nominations: {
        Row: {
          id: string
          motivation: string | null
          nomination_date: string | null
          nominator_id: string
          nominee_id: string
          pool_id: string
          status: string | null
        }
        Insert: {
          id?: string
          motivation?: string | null
          nomination_date?: string | null
          nominator_id: string
          nominee_id: string
          pool_id: string
          status?: string | null
        }
        Update: {
          id?: string
          motivation?: string | null
          nomination_date?: string | null
          nominator_id?: string
          nominee_id?: string
          pool_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_nominations_nominator_id_fkey"
            columns: ["nominator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_nominations_nominee_id_fkey"
            columns: ["nominee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_nominations_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "investment_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_objectives: {
        Row: {
          contribution_type: string
          created_at: string | null
          current_amount: number
          description: string | null
          due_date: string | null
          frequency: string | null
          id: string
          pool_id: string
          status: string | null
          target_amount: number
          title: string
          updated_at: string | null
        }
        Insert: {
          contribution_type: string
          created_at?: string | null
          current_amount?: number
          description?: string | null
          due_date?: string | null
          frequency?: string | null
          id?: string
          pool_id: string
          status?: string | null
          target_amount: number
          title: string
          updated_at?: string | null
        }
        Update: {
          contribution_type?: string
          created_at?: string | null
          current_amount?: number
          description?: string | null
          due_date?: string | null
          frequency?: string | null
          id?: string
          pool_id?: string
          status?: string | null
          target_amount?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_objectives_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "investment_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_reports: {
        Row: {
          ai_summary: string | null
          content: string
          created_at: string | null
          drbe_insights: string | null
          id: string
          pool_id: string
          report_month: string
          report_year: number
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_summary?: string | null
          content: string
          created_at?: string | null
          drbe_insights?: string | null
          id?: string
          pool_id: string
          report_month: string
          report_year: number
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_summary?: string | null
          content?: string
          created_at?: string | null
          drbe_insights?: string | null
          id?: string
          pool_id?: string
          report_month?: string
          report_year?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_reports_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "investment_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_votes: {
        Row: {
          candidate_id: string
          id: string
          pool_id: string
          vote_date: string | null
          voter_id: string
        }
        Insert: {
          candidate_id: string
          id?: string
          pool_id: string
          vote_date?: string | null
          voter_id: string
        }
        Update: {
          candidate_id?: string
          id?: string
          pool_id?: string
          vote_date?: string | null
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_votes_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "investment_pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          profile_data_jsonb: Json | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          profile_data_jsonb?: Json | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          profile_data_jsonb?: Json | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ratings_reviews: {
        Row: {
          created_at: string | null
          id: string
          rating: number | null
          review_text: string | null
          reviewer_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["rating_review_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          rating?: number | null
          review_text?: string | null
          reviewer_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["rating_review_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          rating?: number | null
          review_text?: string | null
          reviewer_id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["rating_review_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      remarks: {
        Row: {
          created_at: string | null
          id: string
          opportunity_id: string
          parent_remark_id: string | null
          remark_text: string
          remark_type: Database["public"]["Enums"]["remark_type"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          opportunity_id: string
          parent_remark_id?: string | null
          remark_text: string
          remark_type?: Database["public"]["Enums"]["remark_type"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          opportunity_id?: string
          parent_remark_id?: string | null
          remark_text?: string
          remark_type?: Database["public"]["Enums"]["remark_type"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "remarks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remarks_parent_remark_id_fkey"
            columns: ["parent_remark_id"]
            isOneToOne: false
            referencedRelation: "remarks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          is_verified: boolean | null
          portfolio_url: string | null
          rating: number | null
          review_count: number | null
          service_category: string
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_verified?: boolean | null
          portfolio_url?: string | null
          rating?: number | null
          review_count?: number | null
          service_category: string
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_verified?: boolean | null
          portfolio_url?: string | null
          rating?: number | null
          review_count?: number | null
          service_category?: string
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          assigned_provider_id: string | null
          budget: number | null
          created_at: string | null
          deadline: string | null
          description: string | null
          entrepreneur_id: string
          id: string
          service_category: string
          status: Database["public"]["Enums"]["service_request_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_provider_id?: string | null
          budget?: number | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          entrepreneur_id: string
          id?: string
          service_category: string
          status?: Database["public"]["Enums"]["service_request_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_provider_id?: string | null
          budget?: number | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          entrepreneur_id?: string
          id?: string
          service_category?: string
          status?: Database["public"]["Enums"]["service_request_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_assigned_provider_id_fkey"
            columns: ["assigned_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_task_reports: {
        Row: {
          created_at: string | null
          detailed_report_url: string | null
          feedback_jsonb: Json | null
          id: string
          report_summary: string
          reviewed_at: string | null
          reviewed_by: string | null
          service_provider_id: string
          service_request_id: string
          status: string | null
          submitted_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          detailed_report_url?: string | null
          feedback_jsonb?: Json | null
          id?: string
          report_summary: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_provider_id: string
          service_request_id: string
          status?: string | null
          submitted_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          detailed_report_url?: string | null
          feedback_jsonb?: Json | null
          id?: string
          report_summary?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_provider_id?: string
          service_request_id?: string
          status?: string | null
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_task_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_task_reports_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_task_reports_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      agreement_status:
        | "draft"
        | "entrepreneur_signed"
        | "investor_signed"
        | "admin_signed"
        | "funds_in_escrow"
        | "finalized"
        | "cancelled"
      app_role:
        | "super_admin"
        | "admin"
        | "entrepreneur"
        | "investor"
        | "service_provider"
      audit_action_type:
        | "create"
        | "read"
        | "update"
        | "delete"
        | "login"
        | "logout"
        | "view"
        | "approve"
        | "reject"
        | "fund"
        | "withdraw"
        | "sign"
        | "nominate"
        | "vote"
      milestone_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "skipped"
        | "cancelled"
      offer_status: "pending" | "accepted" | "rejected" | "withdrawn"
      opportunity_status:
        | "draft"
        | "pending_review"
        | "published"
        | "rejected"
        | "funded"
      payment_status:
        | "initiated"
        | "pending_proof"
        | "admin_review"
        | "onward_transfer_pending"
        | "completed"
        | "failed"
        | "refunded"
        | "cancelled"
      payment_type:
        | "investment"
        | "service_fee"
        | "milestone_payout"
        | "admin_transfer"
        | "refund"
      rating_review_type:
        | "entrepreneur_to_investor"
        | "investor_to_entrepreneur"
        | "entrepreneur_to_service_provider"
        | "service_provider_to_entrepreneur"
      remark_type: "public_comment" | "private_note" | "admin_feedback"
      service_request_status:
        | "draft"
        | "published"
        | "assigned"
        | "in_progress"
        | "review_pending"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agreement_status: [
        "draft",
        "entrepreneur_signed",
        "investor_signed",
        "admin_signed",
        "funds_in_escrow",
        "finalized",
        "cancelled",
      ],
      app_role: [
        "super_admin",
        "admin",
        "entrepreneur",
        "investor",
        "service_provider",
      ],
      audit_action_type: [
        "create",
        "read",
        "update",
        "delete",
        "login",
        "logout",
        "view",
        "approve",
        "reject",
        "fund",
        "withdraw",
        "sign",
        "nominate",
        "vote",
      ],
      milestone_status: [
        "pending",
        "in_progress",
        "completed",
        "skipped",
        "cancelled",
      ],
      offer_status: ["pending", "accepted", "rejected", "withdrawn"],
      opportunity_status: [
        "draft",
        "pending_review",
        "published",
        "rejected",
        "funded",
      ],
      payment_status: [
        "initiated",
        "pending_proof",
        "admin_review",
        "onward_transfer_pending",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      payment_type: [
        "investment",
        "service_fee",
        "milestone_payout",
        "admin_transfer",
        "refund",
      ],
      rating_review_type: [
        "entrepreneur_to_investor",
        "investor_to_entrepreneur",
        "entrepreneur_to_service_provider",
        "service_provider_to_entrepreneur",
      ],
      remark_type: ["public_comment", "private_note", "admin_feedback"],
      service_request_status: [
        "draft",
        "published",
        "assigned",
        "in_progress",
        "review_pending",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
