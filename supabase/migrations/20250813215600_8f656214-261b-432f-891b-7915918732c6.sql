-- Create listings table for both borrow and lend listings
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('borrow', 'lend')),
  amount NUMERIC NOT NULL,
  purpose TEXT,
  duration INTEGER NOT NULL, -- months
  interest_rate NUMERIC NOT NULL,
  story TEXT,
  location TEXT,
  collateral TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loan_requests table for requests made to listings
CREATE TABLE public.loan_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  requester_id UUID NOT NULL,
  listing_owner_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  duration INTEGER NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE
);

-- Create loans table for active loans
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  borrower_id UUID NOT NULL,
  lender_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  duration INTEGER NOT NULL, -- months
  monthly_payment NUMERIC NOT NULL,
  remaining_balance NUMERIC NOT NULL,
  payments_made INTEGER NOT NULL DEFAULT 0,
  payments_left INTEGER NOT NULL,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted')),
  next_payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE
);

-- Enable RLS on all tables
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listings
CREATE POLICY "Users can view all active listings" 
ON public.listings 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can create their own listings" 
ON public.listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" 
ON public.listings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for loan_requests
CREATE POLICY "Users can view requests they made or received" 
ON public.loan_requests 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = listing_owner_id);

CREATE POLICY "Users can create loan requests" 
ON public.loan_requests 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Listing owners can update requests to their listings" 
ON public.loan_requests 
FOR UPDATE 
USING (auth.uid() = listing_owner_id);

-- RLS Policies for loans
CREATE POLICY "Users can view their own loans" 
ON public.loans 
FOR SELECT 
USING (auth.uid() = borrower_id OR auth.uid() = lender_id);

CREATE POLICY "System can create loans" 
ON public.loans 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Borrowers can update loan payments" 
ON public.loans 
FOR UPDATE 
USING (auth.uid() = borrower_id);

-- Add triggers for updated_at
CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loan_requests_updated_at
BEFORE UPDATE ON public.loan_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loans_updated_at
BEFORE UPDATE ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();