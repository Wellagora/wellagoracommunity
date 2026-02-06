-- Create sponsor_support_rules table for managing sponsor support campaigns
CREATE TABLE IF NOT EXISTS public.sponsor_support_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope_type text NOT NULL CHECK (scope_type IN ('program', 'category', 'creator', 'event')),
  scope_id uuid NOT NULL,
  amount_per_participant numeric NOT NULL CHECK (amount_per_participant > 0),
  currency text NOT NULL CHECK (currency IN ('HUF', 'EUR')),
  budget_total numeric NOT NULL CHECK (budget_total > 0),
  budget_spent numeric NOT NULL DEFAULT 0 CHECK (budget_spent >= 0),
  max_participants integer CHECK (max_participants IS NULL OR max_participants > 0),
  start_at timestamp with time zone NOT NULL DEFAULT now(),
  end_at timestamp with time zone CHECK (end_at IS NULL OR end_at > start_at),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT budget_check CHECK (budget_spent <= budget_total)
);

-- Create sponsorship_allocations table for tracking individual support allocations
CREATE TABLE IF NOT EXISTS public.sponsorship_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES public.sponsor_support_rules(id) ON DELETE CASCADE,
  sponsor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES public.expert_contents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL CHECK (currency IN ('HUF', 'EUR')),
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'captured', 'released')),
  created_at timestamp with time zone DEFAULT now(),
  captured_at timestamp with time zone,
  released_at timestamp with time zone,
  UNIQUE(rule_id, user_id, content_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sponsor_support_rules_sponsor ON public.sponsor_support_rules(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_support_rules_scope ON public.sponsor_support_rules(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_support_rules_status ON public.sponsor_support_rules(status);
CREATE INDEX IF NOT EXISTS idx_sponsorship_allocations_rule ON public.sponsorship_allocations(rule_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_allocations_user ON public.sponsorship_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_allocations_content ON public.sponsorship_allocations(content_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_allocations_status ON public.sponsorship_allocations(status);

-- Enable RLS
ALTER TABLE public.sponsor_support_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_allocations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsor_support_rules
CREATE POLICY "Sponsors can view their own support rules"
  ON public.sponsor_support_rules FOR SELECT
  USING (auth.uid() = sponsor_id);

CREATE POLICY "Sponsors can create their own support rules"
  ON public.sponsor_support_rules FOR INSERT
  WITH CHECK (auth.uid() = sponsor_id);

CREATE POLICY "Sponsors can update their own support rules"
  ON public.sponsor_support_rules FOR UPDATE
  USING (auth.uid() = sponsor_id);

CREATE POLICY "Sponsors can delete their own support rules"
  ON public.sponsor_support_rules FOR DELETE
  USING (auth.uid() = sponsor_id);

CREATE POLICY "Users can view active support rules for eligible programs"
  ON public.sponsor_support_rules FOR SELECT
  USING (
    status = 'active' 
    AND (start_at IS NULL OR start_at <= now())
    AND (end_at IS NULL OR end_at >= now())
    AND budget_spent < budget_total
    AND (max_participants IS NULL OR (
      SELECT COUNT(*) FROM public.sponsorship_allocations 
      WHERE rule_id = sponsor_support_rules.id 
      AND status IN ('reserved', 'captured')
    ) < max_participants)
  );

-- RLS Policies for sponsorship_allocations
CREATE POLICY "Sponsors can view their own allocations"
  ON public.sponsorship_allocations FOR SELECT
  USING (auth.uid() = sponsor_id);

CREATE POLICY "Users can view their own allocations"
  ON public.sponsorship_allocations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create allocations for themselves"
  ON public.sponsorship_allocations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update allocations"
  ON public.sponsorship_allocations FOR UPDATE
  USING (true);

-- Create trigger to update sponsor_support_rules.updated_at
CREATE OR REPLACE FUNCTION update_sponsor_support_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sponsor_support_rules_updated_at
  BEFORE UPDATE ON public.sponsor_support_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsor_support_rules_updated_at();

-- Create function to automatically update budget_spent when allocations change
CREATE OR REPLACE FUNCTION update_support_rule_budget()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('reserved', 'captured') THEN
    UPDATE public.sponsor_support_rules
    SET budget_spent = budget_spent + NEW.amount
    WHERE id = NEW.rule_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IN ('reserved', 'captured') AND NEW.status = 'released' THEN
      UPDATE public.sponsor_support_rules
      SET budget_spent = budget_spent - OLD.amount
      WHERE id = OLD.rule_id;
    ELSIF OLD.status = 'released' AND NEW.status IN ('reserved', 'captured') THEN
      UPDATE public.sponsor_support_rules
      SET budget_spent = budget_spent + NEW.amount
      WHERE id = NEW.rule_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status IN ('reserved', 'captured') THEN
    UPDATE public.sponsor_support_rules
    SET budget_spent = budget_spent - OLD.amount
    WHERE id = OLD.rule_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_support_rule_budget
  AFTER INSERT OR UPDATE OR DELETE ON public.sponsorship_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_support_rule_budget();
