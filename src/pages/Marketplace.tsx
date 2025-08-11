import { useState } from "react";
import { Search, Filter, Grid, List, Star, Shield, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const loans = [
  {
    id: 1,
    borrower: "Sarah Martinez",
    avatar: "SM",
    amount: 5000,
    rate: 8.5,
    term: 24,
    purpose: "Home Renovation",
    trustScore: 95,
    risk: "Low",
    funded: 85,
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
    trustScore: 88,
    risk: "Medium",
    funded: 62,
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
    trustScore: 92,
    risk: "Low",
    funded: 45,
    timeLeft: "8 days",
    story: "Completing my certification in data science.",
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
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border">
        <h1 className="font-heading font-bold text-xl mb-4">Marketplace</h1>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search loans by purpose, borrower..."
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

      {/* Loans List */}
      <div className="p-4 space-y-4">
        {loans.map((loan) => (
          <Card key={loan.id} className="card-interactive p-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 bg-[var(--gradient-primary)] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">{loan.avatar}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{loan.borrower}</h3>
                      {loan.verified && (
                        <Shield className="w-4 h-4 text-success" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{loan.purpose}</p>
                  </div>
                  <Badge className={`${getRiskColor(loan.risk)} rounded-full`}>
                    {loan.risk}
                  </Badge>
                </div>

                {/* Loan Details */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-2xl font-bold">${loan.amount.toLocaleString()}</p>
                    <p className="text-muted-foreground text-sm">Amount Needed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{loan.rate}%</p>
                    <p className="text-muted-foreground text-sm">{loan.term} months</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Funded: {loan.funded}%</span>
                    <span className="text-muted-foreground">{loan.timeLeft} left</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-[var(--gradient-primary)] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${loan.funded}%` }}
                    ></div>
                  </div>
                </div>

                {/* Trust Score and Story */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-secondary fill-current" />
                    <span className="text-sm font-medium">Trust Score: {loan.trustScore}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{loan.timeLeft}</span>
                  </div>
                </div>

                {/* Story Preview */}
                <p className="text-sm text-muted-foreground mb-4">{loan.story}</p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button className="btn-hero flex-1">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Fund Loan
                  </Button>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}