-- Create the cases table for the case management system
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id),
  assigned_nurse_id UUID REFERENCES public.profiles(id),
  pet_name TEXT NOT NULL,
  pet_species TEXT,
  pet_breed TEXT,
  pet_age TEXT,
  case_title TEXT NOT NULL,
  case_description TEXT,
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'medium',
  symptoms TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  follow_up_date TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cases_customer_id ON public.cases(customer_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_nurse_id ON public.cases(assigned_nurse_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON public.cases(created_at);

-- Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Nurses can view assigned cases" ON public.cases
  FOR SELECT USING (assigned_nurse_id = auth.uid() OR status = 'new');

CREATE POLICY "Nurses can update assigned cases" ON public.cases
  FOR UPDATE USING (assigned_nurse_id = auth.uid());

CREATE POLICY "Customers can view their own cases" ON public.cases
  FOR SELECT USING (customer_id = auth.uid());

-- Grant permissions
GRANT ALL ON public.cases TO authenticated;
GRANT SELECT ON public.cases TO anon;