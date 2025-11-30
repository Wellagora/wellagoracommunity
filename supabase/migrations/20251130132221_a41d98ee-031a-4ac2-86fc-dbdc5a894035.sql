-- Create invoices table for billing and invoice management
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  credit_transaction_id UUID REFERENCES public.credit_transactions(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'credit_purchase', 'one_time')),
  description TEXT,
  amount NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'HUF',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled', 'refunded')),
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  billing_name TEXT,
  billing_address TEXT,
  billing_tax_number TEXT,
  stripe_invoice_id TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_invoices_organization_id ON public.invoices(organization_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);

-- Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Organization members can view their invoices
CREATE POLICY "Org members can view their invoices"
ON public.invoices FOR SELECT TO authenticated
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Policy: Super admins can manage all invoices
CREATE POLICY "Super admins can manage all invoices"
ON public.invoices FOR ALL TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));