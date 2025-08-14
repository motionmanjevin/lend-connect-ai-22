import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Star, MapPin, Calendar, Phone, Mail, MessageCircle, Bookmark, DollarSign, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
        } else {
          // Get user's listings
          const { data: listings } = await supabase
            .from('listings')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active');

          // Get user's loan stats
          const { data: loansAsLender } = await supabase
            .from('loans')
            .select('amount')
            .eq('lender_id', userId);

          const { data: loansAsBorrower } = await supabase
            .from('loans')
            .select('amount')
            .eq('borrower_id', userId);

          const totalAmountLent = loansAsLender?.reduce((sum, loan) => sum + parseFloat(loan.amount.toString()), 0) || 0;
          const totalAmountBorrowed = loansAsBorrower?.reduce((sum, loan) => sum + parseFloat(loan.amount.toString()), 0) || 0;

          setUserData({
            ...profile,
            name: profile.full_name,
            currentListings: listings?.map(listing => ({
              id: listing.id,
              type: listing.listing_type,
              amount: parseFloat(listing.amount.toString()),
              rate: parseFloat(listing.interest_rate.toString()),
              duration: listing.duration,
              purpose: listing.purpose
            })) || [],
            stats: {
              loansGiven: loansAsLender?.length || 0,
              loansReceived: loansAsBorrower?.length || 0,
              totalAmountLent,
              totalAmountBorrowed,
              averageInterestOffered: 0,
              averageInterestAccepted: 0
            },
            verified: true,
            memberSince: new Date(profile.created_at).getFullYear(),
            verifiedDocuments: ["ID", "Phone", "Email"]
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-heading font-bold text-lg">Profile</h1>
        </div>
      </div>

      {/* Profile Header */}
      <div className="p-4 bg-[var(--gradient-hero)] text-white">
        <div className="flex flex-col items-center text-center gap-4 mb-4">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-20 h-20 bg-background/90 rounded-full flex items-center justify-center border-4 border-primary">
              <User className="w-10 h-10 text-primary" />
            </div>
            {userData.verified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-success rounded-full flex items-center justify-center border-2 border-white">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="font-heading font-bold text-xl text-black">{userData.name}</h1>
              <Badge className="bg-secondary text-white">
                Member
              </Badge>
            </div>
            <p className="text-black/80 text-sm mb-1">Member since {userData.memberSince}</p>
            
            {/* Contact Info */}
            <div className="mt-3 space-y-1">
              {userData.phone_number && (
                <div className="flex items-center justify-center gap-2 text-black/80 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>{userData.phone_number}</span>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-black/80 text-sm">
                <Mail className="w-4 h-4" />
                <span>{userData.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-4 relative z-10 pb-24">
        {/* Quick Stats Panel */}
        <Card className="card-elevated p-4">
          <h3 className="font-heading font-semibold mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-semibold">{userData.memberSince}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="font-semibold">GHC {parseFloat(userData.account_balance || 0).toLocaleString()}</p>
            </div>
            {userData.stats.loansGiven > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Loans Given</p>
                <p className="font-semibold">{userData.stats.loansGiven}</p>
              </div>
            )}
            {userData.stats.loansReceived > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Loans Received</p>
                <p className="font-semibold">{userData.stats.loansReceived}</p>
              </div>
            )}
            {userData.stats.totalAmountLent > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Lent</p>
                <p className="font-semibold">GHC {userData.stats.totalAmountLent.toLocaleString()}</p>
              </div>
            )}
            {userData.stats.totalAmountBorrowed > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Borrowed</p>
                <p className="font-semibold">GHC {userData.stats.totalAmountBorrowed.toLocaleString()}</p>
              </div>
            )}
            {userData.stats.averageInterestOffered > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg. Interest Offered</p>
                <p className="font-semibold">{userData.stats.averageInterestOffered}%</p>
              </div>
            )}
            {userData.stats.averageInterestAccepted > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg. Interest Accepted</p>
                <p className="font-semibold">{userData.stats.averageInterestAccepted}%</p>
              </div>
            )}
          </div>
        </Card>

        {/* Current Listings */}
        {userData.currentListings.length > 0 && (
          <Card className="card-elevated p-4">
            <h3 className="font-heading font-semibold mb-3">Current Listings</h3>
            <div className="space-y-3">
              {userData.currentListings.map((listing) => (
                <div key={listing.id} className="border border-border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Badge className={listing.type === "borrow" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}>
                        {listing.type === "borrow" ? "Loan Request" : "Loan Offer"}
                      </Badge>
                      <p className="font-semibold mt-1">{listing.purpose}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">GHC {listing.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{listing.rate}% • {listing.duration}mo</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Safety & Transparency */}
        <Card className="card-elevated p-4">
          <h3 className="font-heading font-semibold mb-3">Verification & Safety</h3>
          
          {userData.riskWarning && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
              <p className="text-destructive text-sm font-medium">⚠️ {userData.riskWarning}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-2">Verified Documents:</p>
            <div className="flex flex-wrap gap-2">
              {userData.verifiedDocuments.map((doc) => (
                <Badge key={doc} className="status-success">
                  <Shield className="w-3 h-3 mr-1" />
                  {doc}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Call-to-Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <div className="flex gap-2">
            <Button className="btn-hero flex-1">
              <DollarSign className="w-4 h-4 mr-1" />
              {userData.role === "Lender" ? "Request Loan" : "Offer Loan"}
            </Button>
            <Button variant="outline" size="sm" className="px-3">
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="px-3">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}