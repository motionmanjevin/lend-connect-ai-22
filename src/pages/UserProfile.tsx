import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Star, MapPin, Calendar, Phone, Mail, MessageCircle, Bookmark, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data - in real app this would come from props or API
const userData = {
  id: "1",
  name: "Sarah Martinez",
  avatar: "SM",
  role: "Borrower", // or "Lender" or "Both"
  tagline: "Trusted Borrower Since 2024",
  tier: "Gold",
  location: "Accra, Ghana",
  isOnline: true,
  verified: true,
  phone: "+233 24 123 4567",
  email: "sarah.martinez@email.com",
  memberSince: "2024",
  stats: {
    loansGiven: 0,
    loansReceived: 4,
    totalAmountLent: 0,
    totalAmountBorrowed: 18500,
    averageInterestOffered: 0,
    averageInterestAccepted: 8.2
  },
  currentListings: [
    {
      id: 1,
      type: "borrow",
      amount: 5000,
      rate: 8.5,
      duration: 24,
      purpose: "Home Renovation"
    }
  ],
  verifiedDocuments: ["ID", "Income Proof", "Address"],
  riskWarning: null // or "This user has a history of late payments"
};

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

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
        <div className="flex items-start gap-4 mb-4">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <span className="font-heading font-bold text-2xl">{userData.avatar}</span>
            </div>
            {userData.verified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-success rounded-full flex items-center justify-center border-2 border-white">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-heading font-bold text-xl">{userData.name}</h1>
              <Badge className={`${
                userData.tier === "Gold" ? "bg-secondary" : 
                userData.tier === "Silver" ? "bg-muted" : "bg-accent"
              } text-white`}>
                {userData.tier}
              </Badge>
            </div>
            <p className="text-white/80 text-sm mb-1">{userData.tagline}</p>
            
            {/* Location and Status */}
            <div className="flex items-center gap-3 text-white/70 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{userData.location}</span>
              </div>
              {userData.isOnline && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Online now</span>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Phone className="w-4 h-4" />
                <span>{userData.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Mail className="w-4 h-4" />
                <span>{userData.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-4 relative z-10">
        {/* Quick Stats Panel */}
        <Card className="card-elevated p-4">
          <h3 className="font-heading font-semibold mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant="outline">{userData.role}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-semibold">{userData.memberSince}</p>
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
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border">
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