import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Grid, List, Shield, DollarSign, MapPin, Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VerificationModal from "@/components/VerificationModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// No hardcoded data - everything comes from the database now

const filterOptions = [
  { label: "All Amounts", value: "all" },
  { label: "GHC 1K - 5K", value: "1-5k" },
  { label: "GHC 5K - 15K", value: "5-15k" },
  { label: "GHC 15K+", value: "15k+" }
];

const sortOptions = [
  { label: "Best Returns", value: "returns" },
  { label: "Safest", value: "safest" },
  { label: "Fastest Funding", value: "fastest" }
];

export default function Marketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"borrow" | "lend" | "requests">("borrow");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sentOffers, setSentOffers] = useState<Set<string>>(new Set());
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [acceptedRequests, setAcceptedRequests] = useState<Set<string>>(new Set());
  const [declinedRequests, setDeclinedRequests] = useState<Set<string>>(new Set());
  const [selectedListing, setSelectedListing] = useState<{ id: string; title: string; type: string; ownerId: string } | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  
  // Real data from database
  const [borrowListings, setBorrowListings] = useState<any[]>([]);
  const [lendListings, setLendListings] = useState<any[]>([]);
  const [incomingRequestsData, setIncomingRequestsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reset scroll position on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadListings = async () => {
      try {
        console.log('Loading listings...');
        
        // Load borrow listings
        const { data: borrowData, error: borrowError } = await supabase
          .from('listings')
          .select(`
            *,
            profiles!listings_user_id_fkey(full_name, email)
          `)
          .eq('listing_type', 'borrow')
          .eq('status', 'active');

        if (borrowError) {
          console.error('Error loading borrow listings:', borrowError);
        } else {
          console.log('Borrow listings loaded:', borrowData);
        }

        // Load lend listings
        const { data: lendData, error: lendError } = await supabase
          .from('listings')
          .select(`
            *,
            profiles!listings_user_id_fkey(full_name, email)
          `)
          .eq('listing_type', 'lend')
          .eq('status', 'active');

        if (lendError) {
          console.error('Error loading lend listings:', lendError);
        } else {
          console.log('Lend listings loaded:', lendData);
        }

        // Load incoming requests if user is logged in
        let requestsData = [];
        if (user) {
          const { data, error: requestsError } = await supabase
            .from('loan_requests')
            .select(`
              *,
              listings!loan_requests_listing_id_fkey(*),
              profiles!loan_requests_requester_id_fkey(full_name, email)
            `)
            .eq('listing_owner_id', user.id)
            .eq('status', 'pending');
          
          if (requestsError) {
            console.error('Error loading requests:', requestsError);
          } else {
            console.log('Incoming requests loaded:', data);
            requestsData = data || [];
          }
        }

        setBorrowListings(borrowData || []);
        setLendListings(lendData || []);
        setIncomingRequestsData(requestsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading listings:', error);
        setLoading(false);
      }
    };

    loadListings();
  }, [user]);

  const handleMakeOffer = (id: string, title: string, type: string, ownerId: string) => {
    setSelectedListing({ id, title, type, ownerId });
    setIsVerificationModalOpen(true);
  };

  const handleRequestLoan = (id: string, title: string, type: string, ownerId: string) => {
    setSelectedListing({ id, title, type, ownerId });
    setIsVerificationModalOpen(true);
  };

  const handleOfferVerified = async () => {
    if (!selectedListing || !user) return;
    
    try {
      // Get listing details
      const { data: listingData } = await supabase
        .from('listings')
        .select('*')
        .eq('id', selectedListing.id)
        .single();

      // Create loan request
      const { error } = await supabase
        .from('loan_requests')
        .insert({
          listing_id: selectedListing.id,
          requester_id: user.id,
          listing_owner_id: selectedListing.ownerId,
          amount: listingData?.amount || 0,
          interest_rate: listingData?.interest_rate || 0,
          duration: listingData?.duration || 0,
          message: "I would like to make an offer for your loan request."
        });

      if (error) throw error;

      setSentOffers(prev => new Set([...prev, selectedListing.id]));
      toast.success("Offer sent successfully!");
    } catch (error) {
      console.error('Error sending offer:', error);
      toast.error("Failed to send offer. Please try again.");
    }
  };

  const handleRequestVerified = async () => {
    if (!selectedListing || !user) return;
    
    try {
      // Get listing details
      const { data: listingData } = await supabase
        .from('listings')
        .select('*')
        .eq('id', selectedListing.id)
        .single();

      // Create loan request
      const { error } = await supabase
        .from('loan_requests')
        .insert({
          listing_id: selectedListing.id,
          requester_id: user.id,
          listing_owner_id: selectedListing.ownerId,
          amount: listingData?.amount || 0,
          interest_rate: listingData?.interest_rate || 0,
          duration: listingData?.duration || 0,
          message: "I would like to request a loan from your offer."
        });

      if (error) throw error;

      setSentRequests(prev => new Set([...prev, selectedListing.id]));
      toast.success("Loan request sent successfully!");
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error("Failed to send request. Please try again.");
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const request = incomingRequestsData.find(r => r.id === requestId);
      if (!request || !user) return;

      // Calculate monthly payment
      const principal = parseFloat(request.amount);
      const monthlyRate = parseFloat(request.interest_rate) / 100 / 12;
      const numPayments = parseInt(request.duration);
      const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                            (Math.pow(1 + monthlyRate, numPayments) - 1);

      // Create loan
      const { error: loanError } = await supabase
        .from('loans')
        .insert({
          listing_id: request.listing_id,
          borrower_id: request.requester_id,
          lender_id: user.id,
          amount: principal,
          interest_rate: parseFloat(request.interest_rate),
          duration: numPayments,
          monthly_payment: monthlyPayment,
          remaining_balance: principal,
          payments_left: numPayments,
          purpose: request.listings?.purpose || 'General loan',
          next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });

      if (loanError) throw loanError;

      // Update request status
      const { error: updateError } = await supabase
        .from('loan_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Update listing status
      const { error: listingError } = await supabase
        .from('listings')
        .update({ status: 'completed' })
        .eq('id', request.listing_id);

      if (listingError) throw listingError;

      // Transfer money from lender to borrower
      const { data: lenderProfile } = await supabase
        .from('profiles')
        .select('account_balance')
        .eq('user_id', user.id)
        .single();

      const { data: borrowerProfile } = await supabase
        .from('profiles')
        .select('account_balance')
        .eq('user_id', request.requester_id)
        .single();

      if (lenderProfile && borrowerProfile) {
        const lenderBalance = parseFloat(lenderProfile.account_balance?.toString() || '0');
        const borrowerBalance = parseFloat(borrowerProfile.account_balance?.toString() || '0');

        if (lenderBalance >= principal) {
          // Update balances
          await supabase
            .from('profiles')
            .update({ account_balance: lenderBalance - principal })
            .eq('user_id', user.id);

          await supabase
            .from('profiles')
            .update({ account_balance: borrowerBalance + principal })
            .eq('user_id', request.requester_id);

          // Create transaction records
          await supabase
            .from('transactions')
            .insert([
              {
                user_id: user.id,
                amount: -principal,
                transaction_type: 'loan_disbursement',
                status: 'completed'
              },
              {
                user_id: request.requester_id,
                amount: principal,
                transaction_type: 'loan_received',
                status: 'completed'
              }
            ]);
        }
      }

      setAcceptedRequests(prev => new Set([...prev, requestId]));
      toast.success("Request accepted and loan created successfully!");
      
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error("Failed to accept request. Please try again.");
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('loan_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);

      if (error) throw error;

      setDeclinedRequests(prev => new Set([...prev, requestId]));
      toast.success("Request declined.");
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error("Failed to decline request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border">
        <h1 className="font-heading font-bold text-xl mb-4">Marketplace</h1>
        
        {/* Tab Selection */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <Button
            variant={activeTab === "borrow" ? "default" : "outline"}
            onClick={() => setActiveTab("borrow")}
            className="flex-shrink-0 min-w-fit"
          >
            Borrower Requests
          </Button>
          <Button
            variant={activeTab === "lend" ? "default" : "outline"}
            onClick={() => setActiveTab("lend")}
            className="flex-shrink-0 min-w-fit"
          >
            Lender Offers
          </Button>
          <Button
            variant={activeTab === "requests" ? "default" : "outline"}
            onClick={() => setActiveTab("requests")}
            className="flex-shrink-0 min-w-fit"
          >
            Requests
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={activeTab === "borrow" ? "Search by purpose, borrower..." : "Search by lender, criteria..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button variant="outline" size="sm" className="flex-shrink-0">
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </Button>
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedFilter === option.value ? "default" : "outline"}
                size="sm"
                className="flex-shrink-0"
                onClick={() => setSelectedFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* View Toggle and Sort */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === "card" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("card")}
              className="w-8 h-8 p-0"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="w-8 h-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          <select className="text-sm border border-border rounded-lg px-3 py-1 bg-background">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listings */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading listings...</p>
          </div>
        ) : activeTab === "borrow" ? (
          borrowListings.map((listing) => (
            <Card key={listing.id} className="card-interactive p-4">
              <div className="w-full">
                {/* Content */}
                <div className="w-full">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{listing.profiles?.full_name || 'Anonymous'}</h3>
                        <Shield className="w-4 h-4 text-success" />
                      </div>
                      <p className="text-muted-foreground text-sm">{listing.purpose || 'General loan'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {Math.floor((Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-2xl font-bold">GHC {parseFloat(listing.amount).toLocaleString()}</p>
                      <p className="text-muted-foreground text-sm">Amount Needed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">Up to {parseFloat(listing.interest_rate)}%</p>
                      <p className="text-muted-foreground text-sm">{listing.duration} months</p>
                    </div>
                  </div>

                  {/* Location and Story */}
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{listing.location || 'Not specified'}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{listing.story}</p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      className={sentOffers.has(listing.id) ? "bg-success text-success-foreground hover:bg-success/90 flex-1" : "btn-hero flex-1"}
                      onClick={() => handleMakeOffer(listing.id, listing.purpose || 'loan', 'borrow', listing.user_id)}
                      disabled={sentOffers.has(listing.id) || listing.user_id === user?.id}
                    >
                      {sentOffers.has(listing.id) ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Sent Offer
                        </>
                      ) : listing.user_id === user?.id ? (
                        "Your Listing"
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-1" />
                          Make Offer
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/user-profile/${listing.user_id}`)}>
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : activeTab === "lend" ? (
          lendListings.map((listing) => (
            <Card key={listing.id} className="card-interactive p-4">
              <div className="w-full">
                {/* Content */}
                <div className="w-full">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{listing.profiles?.full_name || 'Anonymous'}</h3>
                        <Shield className="w-4 h-4 text-success" />
                      </div>
                      <p className="text-muted-foreground text-sm">Lending Offer</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {Math.floor((Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
                  </div>

                  {/* Offer Details */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-2xl font-bold">GHC {parseFloat(listing.amount).toLocaleString()}</p>
                      <p className="text-muted-foreground text-sm">Max Amount</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-secondary">From {parseFloat(listing.interest_rate)}%</p>
                      <p className="text-muted-foreground text-sm">Up to {listing.duration} months</p>
                    </div>
                  </div>

                  {/* Location and Story */}
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{listing.location || 'Not specified'}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{listing.story}</p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      className={sentRequests.has(listing.id) ? "bg-success text-success-foreground hover:bg-success/90 flex-1" : "btn-hero flex-1"}
                      onClick={() => handleRequestLoan(listing.id, 'lending offer', 'lend', listing.user_id)}
                      disabled={sentRequests.has(listing.id) || listing.user_id === user?.id}
                    >
                      {sentRequests.has(listing.id) ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Sent Request
                        </>
                      ) : listing.user_id === user?.id ? (
                        "Your Listing"
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-1" />
                          Request Loan
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/user-profile/${listing.user_id}`)}>
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          incomingRequestsData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No incoming requests at the moment.</p>
            </div>
          ) : (
            incomingRequestsData.map((request) => (
              <Card key={request.id} className="card-interactive p-4">
                <div className="w-full">
                  {/* Content */}
                  <div className="w-full">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{request.profiles?.full_name || 'Anonymous'}</h3>
                          <Shield className="w-4 h-4 text-success" />
                        </div>
                        <p className="text-muted-foreground text-sm">{request.listings?.purpose || 'General loan'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {Math.floor((Date.now() - new Date(request.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </p>
                      </div>
                    </div>

                    {/* For Listing Badge */}
                    <Badge variant="outline" className="mb-3">
                      For: {request.listings?.purpose || 'Your listing'}
                    </Badge>

                    {/* Request Details */}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-2xl font-bold">GHC {parseFloat(request.amount || request.listings?.amount || 0).toLocaleString()}</p>
                        <p className="text-muted-foreground text-sm">Requested Amount</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">{parseFloat(request.interest_rate || request.listings?.interest_rate || 0)}%</p>
                        <p className="text-muted-foreground text-sm">{request.duration || request.listings?.duration || 0} months</p>
                      </div>
                    </div>

                    {/* Location and Message */}
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{request.listings?.location || 'Not specified'}</span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{request.message || 'No message provided'}</p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {acceptedRequests.has(request.id) ? (
                        <Button className="bg-success text-success-foreground hover:bg-success/90 flex-1" disabled>
                          <Check className="w-4 h-4 mr-1" />
                          Accepted - Processing Transfer
                        </Button>
                      ) : declinedRequests.has(request.id) ? (
                        <Button variant="destructive" className="flex-1" disabled>
                          <X className="w-4 h-4 mr-1" />
                          Declined
                        </Button>
                      ) : (
                        <>
                          <Button 
                            className="btn-hero flex-1"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="flex-1"
                            onClick={() => handleDeclineRequest(request.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => navigate(`/user-profile/${request.requester_id}`)}>
                      View Profile
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )
        )}

        {/* Empty state for no listings */}
        {!loading && activeTab === "borrow" && borrowListings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No borrow requests available at the moment.</p>
          </div>
        )}
        
        {!loading && activeTab === "lend" && lendListings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No lending offers available at the moment.</p>
          </div>
        )}
      </div>

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onVerified={activeTab === "borrow" ? handleOfferVerified : handleRequestVerified}
        listingTitle={selectedListing?.title || ""}
      />
    </div>
  );
}