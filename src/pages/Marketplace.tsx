import { useState } from "react";
import { Search, Filter, Grid, List, Shield, DollarSign, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const borrowingRequests = [
  {
    id: 1,
    borrower: "Sarah Martinez",
    avatar: "SM",
    amount: 5000,
    rate: 8.5,
    term: 24,
    purpose: "Home Renovation",
    risk: "Low",
    timeLeft: "5 days",
    story: "Looking to renovate my kitchen and add value to my home.",
    verified: true
  },
  {
    id: 2,
    borrower: "Tech Startup Inc.",
    avatar: "TS",
    amount: 15000,
    rate: 12.0,
    term: 36,
    purpose: "Business Expansion",
    risk: "Medium",
    timeLeft: "12 days",
    story: "Expanding our SaaS platform to serve more customers.",
    verified: true
  },
  {
    id: 3,
    borrower: "Mike Johnson",
    avatar: "MJ",
    amount: 3500,
    rate: 7.2,
    term: 18,
    purpose: "Education",
    risk: "Low",
    timeLeft: "8 days",
    story: "Completing my certification in data science.",
    verified: false
  }
];

const lendingOffers = [
  {
    id: 1,
    lender: "Capital Partners LLC",
    avatar: "CP",
    minAmount: 1000,
    maxAmount: 50000,
    rate: 6.5,
    maxTerm: 36,
    criteria: "Verified income, good credit history",
    verified: true
  },
  {
    id: 2,
    lender: "Jennifer Walsh",
    avatar: "JW",
    minAmount: 5000,
    maxAmount: 25000,
    rate: 8.0,
    maxTerm: 24,
    criteria: "Business loans only, collateral required",
    verified: true
  },
  {
    id: 3,
    lender: "Growth Funding",
    avatar: "GF",
    minAmount: 2000,
    maxAmount: 75000,
    rate: 7.2,
    maxTerm: 48,
    criteria: "Flexible terms, quick approval process",
    verified: false
  }
];

const filterOptions = [
  { label: "All Amounts", value: "all" },
  { label: "$1K - $5K", value: "1-5k" },
  { label: "$5K - $15K", value: "5-15k" },
  { label: "$15K+", value: "15k+" }
];

const sortOptions = [
  { label: "Best Returns", value: "returns" },
  { label: "Safest", value: "safest" },
  { label: "Fastest Funding", value: "fastest" }
];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "status-success";
      case "Medium": return "status-warning";
      case "High": return "bg-destructive/10 text-destructive border border-destructive/20";
      default: return "status-info";
    }
  };

  const renderBorrowingCard = (request: any) => (
    <Card key={request.id} className="card-interactive p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">{request.avatar}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{request.borrower}</h3>
                {request.verified && (
                  <Shield className="w-5 h-5 text-success" />
                )}
              </div>
              <p className="text-muted-foreground">{request.purpose}</p>
            </div>
            <Badge className={`${getRiskColor(request.risk)} rounded-full px-3 py-1`}>
              {request.risk} Risk
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <p className="text-3xl font-bold text-foreground">${request.amount.toLocaleString()}</p>
              <p className="text-muted-foreground text-sm">Amount Requested</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{request.rate}%</p>
              <p className="text-muted-foreground text-sm">{request.term} months</p>
            </div>
          </div>

          <p className="text-muted-foreground mb-4 leading-relaxed">{request.story}</p>

          <div className="flex gap-3">
            <Button className="btn-hero flex-1">
              <DollarSign className="w-4 h-4 mr-2" />
              Fund Request
            </Button>
            <Button variant="outline">
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderLendingCard = (offer: any) => (
    <Card key={offer.id} className="card-interactive p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-secondary rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">{offer.avatar}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{offer.lender}</h3>
                {offer.verified && (
                  <Shield className="w-5 h-5 text-success" />
                )}
              </div>
              <p className="text-muted-foreground">Professional Lender</p>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Available</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <p className="text-2xl font-bold text-foreground">
                ${offer.minAmount.toLocaleString()} - ${offer.maxAmount.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-sm">Lending Range</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{offer.rate}%</p>
              <p className="text-muted-foreground text-sm">From {offer.maxTerm} months</p>
            </div>
          </div>

          <p className="text-muted-foreground mb-4 leading-relaxed">{offer.criteria}</p>

          <div className="flex gap-3">
            <Button className="btn-secondary flex-1">
              <Users className="w-4 h-4 mr-2" />
              Apply for Loan
            </Button>
            <Button variant="outline">
              View Terms
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 bg-card/50 backdrop-blur-sm border-b border-border/50">
        <h1 className="font-heading font-bold text-2xl mb-6">Marketplace</h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search by purpose, amount, or rate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-0 bg-muted/50"
          />
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Button variant="outline" size="sm" className="flex-shrink-0 rounded-full">
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedFilter === option.value ? "default" : "outline"}
              size="sm"
              className="flex-shrink-0 rounded-full"
              onClick={() => setSelectedFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Marketplace Tabs */}
      <div className="p-6">
        <Tabs defaultValue="borrowers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1 bg-muted/50">
            <TabsTrigger value="borrowers" className="rounded-xl">
              <DollarSign className="w-4 h-4 mr-2" />
              Borrowing Requests
            </TabsTrigger>
            <TabsTrigger value="lenders" className="rounded-xl">
              <TrendingUp className="w-4 h-4 mr-2" />
              Lending Offers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="borrowers" className="space-y-4 mt-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold mb-2">Find Borrowing Opportunities</h2>
              <p className="text-muted-foreground">Browse borrowing requests and fund loans to earn returns</p>
            </div>
            {borrowingRequests.map(renderBorrowingCard)}
          </TabsContent>
          
          <TabsContent value="lenders" className="space-y-4 mt-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold mb-2">Explore Lending Options</h2>
              <p className="text-muted-foreground">Connect with lenders offering competitive rates</p>
            </div>
            {lendingOffers.map(renderLendingCard)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}