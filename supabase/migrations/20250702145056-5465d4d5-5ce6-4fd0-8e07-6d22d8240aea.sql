-- Create Service Management Module Database Schema

-- First create enums for various status types
CREATE TYPE service_request_status AS ENUM ('draft', 'pending_acceptance', 'accepted', 'declined', 'negotiating', 'cancelled', 'completed');
CREATE TYPE work_order_status AS ENUM ('in_progress', 'pending_delivery', 'delivered', 'under_review', 'completed', 'cancelled');
CREATE TYPE job_card_status AS ENUM ('not_started', 'in_progress', 'awaiting_client_input', 'completed', 'blocked');

-- Service Categories lookup table (admin-definable)
CREATE TABLE service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Service Requests table
CREATE TABLE service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requestor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  associated_entity_id UUID, -- Can reference opportunities table
  associated_entity_type TEXT DEFAULT 'opportunity', -- 'opportunity' or 'investment'
  service_category_id UUID REFERENCES service_categories(id),
  scope_description TEXT NOT NULL,
  deliverables JSONB DEFAULT '[]'::jsonb, -- Array of strings
  start_date DATE,
  end_date DATE,
  proposed_budget DECIMAL(15,2),
  status service_request_status DEFAULT 'draft',
  selected_service_provider_ids JSONB DEFAULT '[]'::jsonb, -- Array of UUIDs
  attachments JSONB DEFAULT '[]'::jsonb, -- Array of file references
  broadcast_to_all BOOLEAN DEFAULT false,
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
  payment_status payment_status DEFAULT 'pending',
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
  progress_notes JSONB DEFAULT '[]'::jsonb, -- Array of {note, timestamp, author}
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
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'countered'
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
INSERT INTO service_categories (name, description) VALUES
('Legal', 'Legal consulting, contract review, compliance advice'),
('Accounting', 'Financial planning, bookkeeping, tax preparation'),
('Due Diligence', 'Investment analysis, risk assessment, financial auditing'),
('Marketing', 'Brand development, digital marketing, market research'),
('IT Consulting', 'Technology strategy, software development, system integration'),
('Business Strategy', 'Strategic planning, operations consulting, growth advisory'),
('Human Resources', 'Recruitment, HR policies, organizational development'),
('Design', 'UI/UX design, branding, graphic design'),
('Content Creation', 'Copywriting, video production, social media content'),
('Project Management', 'Project planning, execution oversight, delivery management');

-- Enable Row Level Security
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_categories
CREATE POLICY "Everyone can view service categories" ON service_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage service categories" ON service_categories FOR ALL USING (get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role]));

-- RLS Policies for service_requests
CREATE POLICY "Requestors can manage their service requests" ON service_requests FOR ALL USING (requestor_id = auth.uid());
CREATE POLICY "Service providers can view relevant requests" ON service_requests FOR SELECT USING (
  status IN ('pending_acceptance', 'accepted') AND 
  (broadcast_to_all = true OR auth.uid()::text = ANY(SELECT jsonb_array_elements_text(selected_service_provider_ids)))
);
CREATE POLICY "Admins can manage all service requests" ON service_requests FOR ALL USING (get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role]));

-- RLS Policies for work_orders
CREATE POLICY "Work order parties can view work orders" ON work_orders FOR SELECT USING (
  service_provider_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM service_requests WHERE id = work_orders.service_request_id AND requestor_id = auth.uid()) OR
  get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role])
);
CREATE POLICY "Service providers can update their work orders" ON work_orders FOR UPDATE USING (service_provider_id = auth.uid());
CREATE POLICY "Requestors can update work order status" ON work_orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM service_requests WHERE id = work_orders.service_request_id AND requestor_id = auth.uid())
);
CREATE POLICY "System can create work orders" ON work_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all work orders" ON work_orders FOR ALL USING (get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role]));

-- RLS Policies for job_cards
CREATE POLICY "Work order parties can view job cards" ON job_cards FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM work_orders wo 
    JOIN service_requests sr ON wo.service_request_id = sr.id 
    WHERE wo.id = job_cards.work_order_id 
    AND (wo.service_provider_id = auth.uid() OR sr.requestor_id = auth.uid())
  ) OR get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role])
);
CREATE POLICY "Service providers can manage job cards" ON job_cards FOR ALL USING (
  EXISTS (SELECT 1 FROM work_orders WHERE id = job_cards.work_order_id AND service_provider_id = auth.uid())
);
CREATE POLICY "Admins can manage all job cards" ON job_cards FOR ALL USING (get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role]));

-- RLS Policies for service_negotiations
CREATE POLICY "Negotiation parties can view negotiations" ON service_negotiations FOR SELECT USING (
  service_provider_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM service_requests WHERE id = service_negotiations.service_request_id AND requestor_id = auth.uid()) OR
  get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role])
);
CREATE POLICY "Service providers can create negotiations" ON service_negotiations FOR INSERT WITH CHECK (service_provider_id = auth.uid());
CREATE POLICY "Service providers can update their negotiations" ON service_negotiations FOR UPDATE USING (service_provider_id = auth.uid());
CREATE POLICY "Requestors can respond to negotiations" ON service_negotiations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM service_requests WHERE id = service_negotiations.service_request_id AND requestor_id = auth.uid())
);
CREATE POLICY "Admins can manage all negotiations" ON service_negotiations FOR ALL USING (get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role]));

-- RLS Policies for work_order_reviews
CREATE POLICY "Everyone can view reviews" ON work_order_reviews FOR SELECT USING (true);
CREATE POLICY "Work order parties can create reviews" ON work_order_reviews FOR INSERT WITH CHECK (
  reviewer_id = auth.uid() AND EXISTS (
    SELECT 1 FROM work_orders wo 
    JOIN service_requests sr ON wo.service_request_id = sr.id 
    WHERE wo.id = work_order_reviews.work_order_id 
    AND (wo.service_provider_id = auth.uid() OR sr.requestor_id = auth.uid())
  )
);
CREATE POLICY "Reviewers can update their reviews" ON work_order_reviews FOR UPDATE USING (reviewer_id = auth.uid());
CREATE POLICY "Admins can manage all reviews" ON work_order_reviews FOR ALL USING (get_current_user_role() = ANY (ARRAY['super_admin'::app_role, 'admin'::app_role]));

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_cards_updated_at BEFORE UPDATE ON job_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_negotiations_updated_at BEFORE UPDATE ON service_negotiations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_order_reviews_updated_at BEFORE UPDATE ON work_order_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_service_requests_requestor_id ON service_requests(requestor_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_category ON service_requests(service_category_id);
CREATE INDEX idx_work_orders_service_provider_id ON work_orders(service_provider_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_job_cards_work_order_id ON job_cards(work_order_id);
CREATE INDEX idx_job_cards_status ON job_cards(status);
CREATE INDEX idx_service_negotiations_request_id ON service_negotiations(service_request_id);
CREATE INDEX idx_service_negotiations_provider_id ON service_negotiations(service_provider_id);