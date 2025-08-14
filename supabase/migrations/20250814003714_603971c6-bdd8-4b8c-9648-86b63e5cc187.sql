-- Add foreign key relationships for better data integrity and proper joins
ALTER TABLE listings 
ADD CONSTRAINT listings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

ALTER TABLE loan_requests 
ADD CONSTRAINT loan_requests_listing_id_fkey 
FOREIGN KEY (listing_id) REFERENCES listings(id);

ALTER TABLE loan_requests 
ADD CONSTRAINT loan_requests_requester_id_fkey 
FOREIGN KEY (requester_id) REFERENCES profiles(user_id);

ALTER TABLE loan_requests 
ADD CONSTRAINT loan_requests_listing_owner_id_fkey 
FOREIGN KEY (listing_owner_id) REFERENCES profiles(user_id);

ALTER TABLE loans 
ADD CONSTRAINT loans_listing_id_fkey 
FOREIGN KEY (listing_id) REFERENCES listings(id);

ALTER TABLE loans 
ADD CONSTRAINT loans_borrower_id_fkey 
FOREIGN KEY (borrower_id) REFERENCES profiles(user_id);

ALTER TABLE loans 
ADD CONSTRAINT loans_lender_id_fkey 
FOREIGN KEY (lender_id) REFERENCES profiles(user_id);

ALTER TABLE transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);