
-- Missing Enums
CREATE TYPE public.milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('initiated', 'pending_proof', 'admin_review', 'onward_transfer_pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE public.payment_type AS ENUM ('investment', 'service_fee', 'milestone_payout', 'admin_transfer', 'refund');
CREATE TYPE public.service_request_status AS ENUM ('draft', 'published', 'assigned', 'in_progress', 'review_pending', 'completed', 'cancelled');
CREATE TYPE public.agreement_status AS ENUM ('draft', 'entrepreneur_signed', 'investor_signed', 'admin_signed', 'funds_in_escrow', 'finalized', 'cancelled');
CREATE TYPE public.audit_action_type AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'view', 'approve', 'reject', 'fund', 'withdraw', 'sign', 'nominate', 'vote');
CREATE TYPE public.remark_type AS ENUM ('public_comment', 'private_note', 'admin_feedback');
CREATE TYPE public.rating_review_type AS ENUM ('entrepreneur_to_investor', 'investor_to_entrepreneur', 'entrepreneur_to_service_provider', 'service_provider_to_entrepreneur');

-- Missing Tables

-- Payments table: Tracks all financial transactions
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  amount NUMERIC(18, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  payment_type public.payment_type NOT NULL,
  status public.payment_status DEFAULT 'initiated'::public.payment_status,
  transaction_ref TEXT UNIQUE,
  payment_method TEXT,
  payer_proof_url TEXT,
  admin_confirm_at TIMESTAMP WITH TIME ZONE,
  admin_onward_proof_url TEXT,
  transaction_fees_jsonb JSONB,
  payer_banking_details_jsonb JSONB,
  receiver_banking_details_jsonb JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Escrow Accounts table: Manages funds held in trust
CREATE TABLE public.escrow_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  account_holder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  balance NUMERIC(18, 2) DEFAULT 0.00 NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.escrow_accounts ENABLE ROW LEVEL SECURITY;

-- Milestones table: Tracks project progress within an opportunity
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status public.milestone_status DEFAULT 'pending'::public.milestone_status,
  amount_allocated NUMERIC(18, 2),
  completion_proof_url TEXT,
  payment_status public.payment_status,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Agreements table: Formalized contracts after offer acceptance
CREATE TABLE public.agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID UNIQUE NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  entrepreneur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agreement_text TEXT,
  terms_jsonb JSONB NOT NULL,
  entrepreneur_signature_url TEXT,
  investor_signature_url TEXT,
  admin_signature_url TEXT,
  status public.agreement_status DEFAULT 'draft'::public.agreement_status,
  signed_at TIMESTAMP WITH TIME ZONE,
  finalized_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;

-- Service Providers table: Registered service providers for the platform
CREATE TABLE public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT NOT NULL,
  service_category TEXT NOT NULL,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  portfolio_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  rating NUMERIC(2, 1),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- Service Requests table: Entrepreneurs requesting services from providers
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrepreneur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  service_category TEXT NOT NULL,
  assigned_provider_id UUID REFERENCES public.service_providers(id) ON DELETE SET NULL,
  status public.service_request_status DEFAULT 'draft'::public.service_request_status,
  budget NUMERIC(18, 2),
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Audit Log table: Records significant events and changes for compliance and debugging
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type public.audit_action_type NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details_jsonb JSONB,
  ip_address INET,
  user_agent TEXT,
  event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Remarks table: Comments/notes on opportunities
CREATE TABLE public.remarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  remark_text TEXT NOT NULL,
  remark_type public.remark_type DEFAULT 'public_comment'::public.remark_type,
  parent_remark_id UUID REFERENCES public.remarks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.remarks ENABLE ROW LEVEL SECURITY;

-- Ratings & Reviews table: Feedback system
CREATE TABLE public.ratings_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type public.rating_review_type NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.ratings_reviews ENABLE ROW LEVEL SECURITY;

-- Announcements table: Platform-wide or role-specific announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_roles public.app_role[],
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Investment Pools table: For collective investment
CREATE TABLE public.investment_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(18, 2) NOT NULL,
  current_amount NUMERIC(18, 2) DEFAULT 0.00 NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'funded', 'cancelled')),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  current_leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  election_nomination_start TIMESTAMP WITH TIME ZONE,
  election_nomination_end TIMESTAMP WITH TIME ZONE,
  election_voting_start TIMESTAMP WITH TIME ZONE,
  election_voting_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.investment_pools ENABLE ROW LEVEL SECURITY;

-- Pool Members table: Members of an investment pool
CREATE TABLE public.pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.investment_pools(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  investment_contribution NUMERIC(18, 2) DEFAULT 0.00,
  UNIQUE(pool_id, member_id)
);
ALTER TABLE public.pool_members ENABLE ROW LEVEL SECURITY;

-- Pool Nominations table: To track nominations for pool leadership
CREATE TABLE public.pool_nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.investment_pools(id) ON DELETE CASCADE,
  nominee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nominator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nomination_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  motivation TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  UNIQUE(pool_id, nominee_id)
);
ALTER TABLE public.pool_nominations ENABLE ROW LEVEL SECURITY;

-- Pool Votes table: To record anonymous votes in investment pool elections
CREATE TABLE public.pool_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.investment_pools(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pool_id, voter_id)
);
ALTER TABLE public.pool_votes ENABLE ROW LEVEL SECURITY;

-- Service Task Reports table: For service providers to submit detailed reports
CREATE TABLE public.service_task_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  service_provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  report_summary TEXT NOT NULL,
  detailed_report_url TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  feedback_jsonb JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.service_task_reports ENABLE ROW LEVEL SECURITY;

-- Missing JSONB Columns on Existing Tables
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_data_jsonb JSONB;

ALTER TABLE public.opportunities
ADD COLUMN IF NOT EXISTS location_data_jsonb JSONB,
ADD COLUMN IF NOT EXISTS team_data_jsonb JSONB,
ADD COLUMN IF NOT EXISTS profitability_data_jsonb JSONB;

-- Missing Triggers for updated_at on new tables
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_escrow_accounts_updated_at BEFORE UPDATE ON public.escrow_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_agreements_updated_at BEFORE UPDATE ON public.agreements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_remarks_updated_at BEFORE UPDATE ON public.remarks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_ratings_reviews_updated_at BEFORE UPDATE ON public.ratings_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_investment_pools_updated_at BEFORE UPDATE ON public.investment_pools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_pool_members_updated_at BEFORE UPDATE ON public.pool_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_pool_nominations_updated_at BEFORE UPDATE ON public.pool_nominations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_service_task_reports_updated_at BEFORE UPDATE ON public.service_task_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Missing RLS Policies for newly added tables

-- RLS Policies for payments
CREATE POLICY "Users can manage their own payments" ON public.payments
  FOR ALL USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for escrow_accounts
CREATE POLICY "Admins can manage escrow accounts" ON public.escrow_accounts
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for milestones
CREATE POLICY "Entrepreneurs can view/manage their opportunity milestones" ON public.milestones
  FOR ALL USING (opportunity_id IN (SELECT id FROM public.opportunities WHERE entrepreneur_id = auth.uid()));
CREATE POLICY "Investors can view milestones for their investments" ON public.milestones
  FOR SELECT USING (opportunity_id IN (SELECT opportunity_id FROM public.offers WHERE investor_id = auth.uid() AND status = 'accepted'));
CREATE POLICY "Admins can manage all milestones" ON public.milestones
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for agreements
CREATE POLICY "Involved parties can view agreements" ON public.agreements
  FOR SELECT USING (entrepreneur_id = auth.uid() OR investor_id = auth.uid() OR public.get_current_user_role() IN ('super_admin', 'admin'));
CREATE POLICY "Parties can sign agreements" ON public.agreements
  FOR UPDATE USING (
    (auth.uid() = entrepreneur_id AND entrepreneur_signature_url IS NULL) OR
    (auth.uid() = investor_id AND investor_signature_url IS NULL) OR
    (public.get_current_user_role() IN ('super_admin', 'admin') AND admin_signature_url IS NULL)
  ) WITH CHECK (
    (auth.uid() = entrepreneur_id AND entrepreneur_signature_url IS NOT NULL) OR
    (auth.uid() = investor_id AND investor_signature_url IS NOT NULL) OR
    (public.get_current_user_role() IN ('super_admin', 'admin') AND admin_signature_url IS NOT NULL)
  );
CREATE POLICY "Admins can manage all agreements" ON public.agreements
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for service_providers
CREATE POLICY "All authenticated users can view service providers" ON public.service_providers
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Service providers can manage their own profile" ON public.service_providers
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all service providers" ON public.service_providers
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for service_requests
CREATE POLICY "Entrepreneurs can manage their service requests" ON public.service_requests
  FOR ALL USING (entrepreneur_id = auth.uid());
CREATE POLICY "Service providers can view assigned requests" ON public.service_requests
  FOR SELECT USING (assigned_provider_id IN (SELECT id FROM public.service_providers WHERE user_id = auth.uid()));
CREATE POLICY "Service providers can update assigned requests" ON public.service_requests
  FOR UPDATE USING (assigned_provider_id IN (SELECT id FROM public.service_providers WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all service requests" ON public.service_requests
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for audit_log
CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for remarks
CREATE POLICY "All authenticated users can view remarks on public opportunities" ON public.remarks
  FOR SELECT USING (opportunity_id IN (SELECT id FROM public.opportunities WHERE status = 'published'));
CREATE POLICY "Authenticated users can create remarks" ON public.remarks
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update/delete their own remarks" ON public.remarks
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all remarks" ON public.remarks
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for ratings_reviews
CREATE POLICY "All authenticated users can view ratings and reviews" ON public.ratings_reviews
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.ratings_reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "Users can update their own reviews" ON public.ratings_reviews
  FOR UPDATE USING (reviewer_id = auth.uid());
CREATE POLICY "Admins can manage all reviews" ON public.ratings_reviews
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for announcements
CREATE POLICY "All authenticated users can view announcements" ON public.announcements
  FOR SELECT USING (target_roles IS NULL OR public.get_current_user_role() = ANY(target_roles));
CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for investment_pools
CREATE POLICY "All authenticated users can view investment pools" ON public.investment_pools
  FOR SELECT USING (true);
CREATE POLICY "Pool creators and admins can manage pools" ON public.investment_pools
  FOR ALL USING (created_by = auth.uid() OR public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for pool_members
CREATE POLICY "Pool members can view their membership" ON public.pool_members
  FOR SELECT USING (member_id = auth.uid());
CREATE POLICY "Pool members can join pools" ON public.pool_members
  FOR INSERT WITH CHECK (member_id = auth.uid());
CREATE POLICY "Pool members can update their own membership" ON public.pool_members
  FOR UPDATE USING (member_id = auth.uid());
CREATE POLICY "Admins can manage pool memberships" ON public.pool_members
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for pool_nominations
CREATE POLICY "Pool members can view nominations" ON public.pool_nominations
  FOR SELECT USING (pool_id IN (SELECT pool_id FROM public.pool_members WHERE member_id = auth.uid()));
CREATE POLICY "Pool members can nominate" ON public.pool_nominations
  FOR INSERT WITH CHECK (nominator_id = auth.uid());
CREATE POLICY "Nominees can accept/decline nominations" ON public.pool_nominations
  FOR UPDATE USING (nominee_id = auth.uid());
CREATE POLICY "Admins can manage nominations" ON public.pool_nominations
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for pool_votes
CREATE POLICY "Pool members can view votes" ON public.pool_votes
  FOR SELECT USING (pool_id IN (SELECT pool_id FROM public.pool_members WHERE member_id = auth.uid()));
CREATE POLICY "Pool members can vote" ON public.pool_votes
  FOR INSERT WITH CHECK (voter_id = auth.uid());
CREATE POLICY "Admins can manage votes" ON public.pool_votes
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- RLS Policies for service_task_reports
CREATE POLICY "Service providers can manage their reports" ON public.service_task_reports
  FOR ALL USING (service_provider_id = auth.uid());
CREATE POLICY "Entrepreneurs can view reports for their requests" ON public.service_task_reports
  FOR SELECT USING (service_request_id IN (SELECT id FROM public.service_requests WHERE entrepreneur_id = auth.uid()));
CREATE POLICY "Admins can manage all reports" ON public.service_task_reports
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));
