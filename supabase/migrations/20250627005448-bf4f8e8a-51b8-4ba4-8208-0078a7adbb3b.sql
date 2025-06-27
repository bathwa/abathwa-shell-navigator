
-- Pool Discussions: For admin-led topics, open/close, minutes
CREATE TABLE public.pool_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.investment_pools(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.pool_discussions ENABLE ROW LEVEL SECURITY;

-- Pool Objectives: For recurring/goal-based contributions
CREATE TABLE public.pool_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.investment_pools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(18,2) NOT NULL,
  current_amount NUMERIC(18,2) DEFAULT 0.00 NOT NULL,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('recurring', 'one_time', 'goal_based')),
  frequency TEXT CHECK (frequency IN ('weekly', 'monthly', 'quarterly')),
  due_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.pool_objectives ENABLE ROW LEVEL SECURITY;

-- Pool Reports: Monthly, with AI/DRBE summaries
CREATE TABLE public.pool_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.investment_pools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  report_month TEXT NOT NULL,
  report_year INTEGER NOT NULL,
  ai_summary TEXT,
  drbe_insights TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.pool_reports ENABLE ROW LEVEL SECURITY;

-- Pool Investments: If pools can invest as entities
CREATE TABLE public.pool_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.investment_pools(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  amount NUMERIC(18,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.pool_investments ENABLE ROW LEVEL SECURITY;

-- Add triggers for updated_at
CREATE TRIGGER update_pool_discussions_updated_at BEFORE UPDATE ON public.pool_discussions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_pool_objectives_updated_at BEFORE UPDATE ON public.pool_objectives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_pool_reports_updated_at BEFORE UPDATE ON public.pool_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_pool_investments_updated_at BEFORE UPDATE ON public.pool_investments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies
-- Pool Discussions
CREATE POLICY "Pool members can view discussions" ON public.pool_discussions
  FOR SELECT USING (pool_id IN (SELECT pool_id FROM public.pool_members WHERE member_id = auth.uid()));
CREATE POLICY "Pool admins/leaders can create discussions" ON public.pool_discussions
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Pool admins/leaders can close discussions" ON public.pool_discussions
  FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Admins can manage all discussions" ON public.pool_discussions
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- Pool Objectives
CREATE POLICY "Pool members can view objectives" ON public.pool_objectives
  FOR SELECT USING (pool_id IN (SELECT pool_id FROM public.pool_members WHERE member_id = auth.uid()));
CREATE POLICY "Pool admins/leaders can manage objectives" ON public.pool_objectives
  FOR ALL USING (EXISTS (SELECT 1 FROM public.investment_pools WHERE id = pool_id AND (created_by = auth.uid() OR current_leader_id = auth.uid())));
CREATE POLICY "Admins can manage all objectives" ON public.pool_objectives
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- Pool Reports
CREATE POLICY "Pool members can view reports" ON public.pool_reports
  FOR SELECT USING (pool_id IN (SELECT pool_id FROM public.pool_members WHERE member_id = auth.uid()));
CREATE POLICY "Pool admins/leaders can create reports" ON public.pool_reports
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.investment_pools WHERE id = pool_id AND (created_by = auth.uid() OR current_leader_id = auth.uid())));
CREATE POLICY "Pool admins/leaders can manage reports" ON public.pool_reports
  FOR ALL USING (EXISTS (SELECT 1 FROM public.investment_pools WHERE id = pool_id AND (created_by = auth.uid() OR current_leader_id = auth.uid())));
CREATE POLICY "Admins can manage all reports" ON public.pool_reports
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));

-- Pool Investments
CREATE POLICY "Pool members can view pool investments" ON public.pool_investments
  FOR SELECT USING (pool_id IN (SELECT pool_id FROM public.pool_members WHERE member_id = auth.uid()));
CREATE POLICY "Pool admins/leaders can manage pool investments" ON public.pool_investments
  FOR ALL USING (EXISTS (SELECT 1 FROM public.investment_pools WHERE id = pool_id AND (created_by = auth.uid() OR current_leader_id = auth.uid())));
CREATE POLICY "Admins can manage all pool investments" ON public.pool_investments
  FOR ALL USING (public.get_current_user_role() IN ('super_admin', 'admin'));
