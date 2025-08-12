import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Grid, List, Shield, DollarSign, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const borrowRequests = [
  {
    id: 1,
    borrower: "Sarah Martinez",
    avatar: "SM",
    amount: 5000,
    maxRate: 8.5,
    term: 24,
    purpose: "Home Renovation",
    story: "Looking to renovate my kitchen and add value to my home.",
    location: "Accra, Ghana",
    verified: true,
    postedDays: 2
  },
  {
    id: 2,
    borrower: "Tech Startup Inc.",
    avatar: "TS",
    amount: 15000,
    maxRate: 12.0,
    term: 36,
    purpose: "Business Expansion",
    story: "Expanding our SaaS platform to serve more customers.",
    location: "Kumasi, Ghana",
    verified: true,
    postedDays: 5
  },
  {
    id: 3,
    borrower: "Mike Johnson",
    avatar: "MJ",
    amount: 3500,
    maxRate: 7.2,
    term: 18,
    purpose: "Education",
    story: "Completing my certification in data science.",
    location: "Takoradi, Ghana",
    verified: false,
    postedDays: 1
  }
];

const lendOffers = [
  {
    id: 1,
    lender: "Investment Group A",
    avatar: "IG",
    maxAmount: 50000,
    minRate: 9.0,
    maxTerm: 60,
    criteria: "Business loans, verified income required",
    story: "We specialize in funding growing businesses with strong fundamentals.",
    location: "Accra, Ghana",
    verified: true,
    postedDays: 3
  },
  {
    id: 2,
    lender: "Community Fund",
    avatar: "CF",
    maxAmount: 10000,
    minRate: 6.5,
    maxTerm: 24,
    criteria: "Education and personal development",
    story: "Supporting individuals in their educational journey and skill development.",
    location: "Tema, Ghana",
    verified: true,
    postedDays: 1
  },
  {
    id: 3,
    lender: "Sarah Williams",
    avatar: "SW",
    maxAmount: 25000,
    minRate: 8.0,
    maxTerm: 36,
    criteria: "Home improvements and small businesses",
    story: "Helping families improve their homes and entrepreneurs start their businesses.",
    location: "Cape Coast, Ghana",
    verified: true,
    postedDays: 4
  }
];

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
  const [activeTab, setActiveTab] = useState<"borrow" | "lend">("borrow");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border">
        <h1 className="font-heading font-bold text-xl mb-4">Marketplace</h1>
        
        {/* Tab Selection */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "borrow" ? "default" : "outline"}
            onClick={() => setActiveTab("borrow")}
            className="flex-1"
          >
            Borrower Requests
          </Button>
          <Button
            variant={activeTab === "lend" ? "default" : "outline"}
            onClick={() => setActiveTab("lend")}
            className="flex-1"
          >
            Lender Offers
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
        {activeTab === "borrow" ? (
          borrowRequests.map((request) => (
            <Card key={request.id} className="card-interactive p-4">
              <div className="w-full">
                {/* Content */}
                <div className="w-full">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{request.borrower}</h3>
                        {request.verified && (
                          <Shield className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">{request.purpose}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{request.postedDays} days ago</p>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-2xl font-bold">GHC {request.amount.toLocaleString()}</p>
                      <p className="text-muted-foreground text-sm">Amount Needed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">Up to {request.maxRate}%</p>
                      <p className="text-muted-foreground text-sm">{request.term} months</p>
                    </div>
                  </div>

                  {/* Location and Story */}
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{request.location}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{request.story}</p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button className="btn-hero flex-1">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Make Offer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/user-profile/${request.id}`)}>
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          lendOffers.map((offer) => (
            <Card key={offer.id} className="card-interactive p-4">
              <div className="w-full">
                {/* Content */}
                <div className="w-full">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{offer.lender}</h3>
                        {offer.verified && (
                          <Shield className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">{offer.criteria}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{offer.postedDays} days ago</p>
                    </div>
                  </div>

                  {/* Offer Details */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-2xl font-bold">GHC {offer.maxAmount.toLocaleString()}</p>
                      <p className="text-muted-foreground text-sm">Max Amount</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-secondary">From {offer.minRate}%</p>
                      <p className="text-muted-foreground text-sm">Up to {offer.maxTerm} months</p>
                    </div>
                  </div>

                  {/* Location and Story */}
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{offer.location}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{offer.story}</p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button className="btn-hero flex-1">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Request Loan
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/user-profile/${offer.id}`)}>
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}