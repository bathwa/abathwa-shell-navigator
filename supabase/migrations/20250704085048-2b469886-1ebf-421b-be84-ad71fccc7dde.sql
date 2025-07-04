-- Create Service Management Module Database Schema (final working version)

-- Create missing enums for work orders and job cards
CREATE TYPE work_order_status AS ENUM ('in_progress', 'pending_delivery', 'delivered', 'under_review', 'completed', 'cancelled');
CREATE TYPE job_card_status AS ENUM ('not_started', 'in_progress', 'awaiting_client_input', 'completed', 'blocked');

-- Service Categories lookup table (admin-definable)
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Work Orders table (created when service request is accepted)
CREATE TABLE work_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE UNIQUE,
  service_provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agreed_scope TEXT NOT NULL,
  agreed_deliverables JSONB DEFAULT '[]'::jsonb,
  agreed_start_date DATE,
  agreed_end_date DATE,
  agreed_fee DECIMAL(15,2),
  status work_order_status DEFAULT 'in_progress',
  payment_status payment_status DEFAULT 'initiated',
  terms_agreed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job Cards table (granular tasks within work orders)
CREATE TABLE job_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status job_card_status DEFAULT 'not_started',
  progress_notes JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  completion_proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Service Request Negotiations (for counter-proposals)
CREATE TABLE service_negotiations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  service_provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  proposed_scope TEXT,
  proposed_deliverables JSONB DEFAULT '[]'::jsonb,
  proposed_timeline_start DATE,
  proposed_timeline_end DATE,
  proposed_fee DECIMAL(15,2),
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Work Order Reviews (feedback and ratings)
CREATE TABLE work_order_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default service categories
INSERT INTO service_categories (name, description) 
SELECT name, description FROM (VALUES
  ('Legal', 'Legal consulting, contract review, compliance advice'),
  ('Accounting', 'Financial planning, bookkeeping, tax preparation'),
  ('Due Diligence', 'Investment analysis, risk assessment, financial auditing'),
  ('Marketing', 'Brand development, digital marketing, market research'),
  ('IT Consulting', 'Technology strategy, software development, system integration'),
  ('Business Strategy', 'Strategic planning, operations consulting, growth advisory'),
  ('Human Resources', 'Recruitment, HR policies, organizational development'),
  ('Design', 'UI/UX design, branding, graphic design'),
  ('Content Creation', 'Copywriting, video production, social media content'),
  ('Project Management', 'Project planning, execution oversight, delivery management')
) AS new_categories(name, description)
WHERE NOT EXISTS (SELECT 1 FROM service_categories LIMIT 1);

-- Enable Row Level Security
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view service categories" ON service_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage service categories" ON service_categories FOR ALL USING (get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role]));

CREATE POLICY "Work order parties can view work orders" ON work_orders FOR SELECT USING (
  service_provider_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM service_requests WHERE id = work_orders.service_request_id AND entrepreneur_id = auth.uid()) OR
  get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role])
);
CREATE POLICY "Service providers can update their work orders" ON work_orders FOR UPDATE USING (service_provider_id = auth.uid());
CREATE POLICY "Requestors can update work order status" ON work_orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM service_requests WHERE id = work_orders.service_request_id AND entrepreneur_id = auth.uid())
);
CREATE POLICY "System can create work orders" ON work_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all work orders" ON work_orders FOR ALL USING (get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role]));

CREATE POLICY "Work order parties can view job cards" ON job_cards FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM work_orders wo 
    JOIN service_requests sr ON wo.service_request_id = sr.id 
    WHERE wo.id = job_cards.work_order_id 
    AND (wo.service_provider_id = auth.uid() OR sr.entrepreneur_id = auth.uid())
  ) OR get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role])
);
CREATE POLICY "Service providers can manage job cards" ON job_cards FOR ALL USING (
  EXISTS (SELECT 1 FROM work_orders WHERE id = job_cards.work_order_id AND service_provider_id = auth.uid())
);
CREATE POLICY "Admins can manage all job cards" ON job_cards FOR ALL USING (get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role]));

CREATE POLICY "Negotiation parties can view negotiations" ON service_negotiations FOR SELECT USING (
  service_provider_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM service_requests WHERE id = service_negotiations.service_request_id AND entrepreneur_id = auth.uid()) OR
  get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role])
);
CREATE POLICY "Service providers can create negotiations" ON service_negotiations FOR INSERT WITH CHECK (service_provider_id = auth.uid());
CREATE POLICY "Service providers can update their negotiations" ON service_negotiations FOR UPDATE USING (service_provider_id = auth.uid());
CREATE POLICY "Requestors can respond to negotiations" ON service_negotiations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM service_requests WHERE id = service_negotiations.service_request_id AND entrepreneur_id = auth.uid())
);
CREATE POLICY "Admins can manage all negotiations" ON service_negotiations FOR ALL USING (get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role]));

CREATE POLICY "Everyone can view reviews" ON work_order_reviews FOR SELECT USING (true);
CREATE POLICY "Work order parties can create reviews" ON work_order_reviews FOR INSERT WITH CHECK (
  reviewer_id = auth.uid() AND EXISTS (
    SELECT 1 FROM work_orders wo 
    JOIN service_requests sr ON wo.service_request_id = sr.id 
    WHERE wo.id = work_order_reviews.work_order_id 
    AND (wo.service_provider_id = auth.uid() OR sr.entrepreneur_id = auth.uid())
  )
);
CREATE POLICY "Reviewers can update their reviews" ON work_order_reviews FOR UPDATE USING (reviewer_id = auth.uid());
CREATE POLICY "Admins can manage all reviews" ON work_order_reviews FOR ALL USING (get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role]));

-- Add triggers for updated_at timestamps using existing update_updated_at function
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_job_cards_updated_at BEFORE UPDATE ON job_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_service_negotiations_updated_at BEFORE UPDATE ON service_negotiations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_work_order_reviews_updated_at BEFORE UPDATE ON work_order_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add indexes for performance
CREATE INDEX idx_work_orders_service_provider_id ON work_orders(service_provider_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_job_cards_work_order_id ON job_cards(work_order_id);
CREATE INDEX idx_job_cards_status ON job_cards(status);
CREATE INDEX idx_service_negotiations_request_id ON service_negotiations(service_request_id);
CREATE INDEX idx_service_negotiations_provider_id ON service_negotiations(service_provider_id);