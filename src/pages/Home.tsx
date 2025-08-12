import { Bell, Plus, TrendingUp, DollarSign, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-image.jpg";

const quickActions = [
  { icon: Plus, label: "Request Loan", path: "/request-loan", color: "accent" },
  { icon: TrendingUp, label: "Fund Loan", path: "/marketplace", color: "secondary" },
  { icon: DollarSign, label: "Repay Now", path: "/loans", color: "success" },
  { icon: Shield, label: "Invite Friends", path: "/social", color: "info" },
];

const recommendations = [
  {
    id: 1,
    title: "Personal Loan - $5,000",
    rate: "8.5%",
    term: "24 months",
    borrower: "Sarah M.",
    trustScore: 95,
    risk: "Low"
  },
  {
    id: 2,
    title: "Business Loan - $15,000",
    rate: "12.0%",
    term: "36 months",
    borrower: "Tech Startup Inc.",
    trustScore: 88,
    risk: "Medium"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div
          className="h-48 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-[var(--gradient-primary)] opacity-90"></div>
          <div className="relative z-10 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="font-heading font-bold text-lg">JD</span>
                </div>
                <div>
                  <h1 className="font-heading font-semibold text-lg">Good morning, John!</h1>
                  <p className="text-white/80 text-sm">Ready to lend or borrow today?</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 -mt-8 relative z-20">
        {/* Balance Card */}
        <Card className="card-elevated p-6 bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Total Balance</p>
              <h2 className="font-heading font-bold text-2xl">$12,450.00</h2>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">This Month</p>
              <p className="text-success font-semibold">+$340.50</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" size="sm" className="h-10">
              Deposit
            </Button>
            <Button variant="outline" size="sm" className="h-10">
              Withdraw
            </Button>
          </div>
        </Card>

        {/* Loan Snapshot */}
        <Card className="card-elevated p-6">
          <h3 className="font-heading font-semibold mb-4">Active Loans</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">3</p>
              <p className="text-muted-foreground text-sm">Lending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">1</p>
              <p className="text-muted-foreground text-sm">Borrowing</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div>
          <h3 className="font-heading font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.label}
                  className="card-interactive p-4 text-center"
                >
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-${action.color}/10`}>
                    <Icon className={`w-6 h-6 text-${action.color}`} />
                  </div>
                  <p className="font-medium text-sm">{action.label}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* AI Recommendations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">AI Recommendations</h3>
            <Button variant="ghost" size="sm" className="text-primary">
              <Zap className="w-4 h-4 mr-1" />
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recommendations.map((loan) => (
              <Card key={loan.id} className="card-interactive p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{loan.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    loan.risk === "Low" ? "status-success" : "status-warning"
                  }`}>
                    {loan.risk} Risk
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{loan.rate} APR • {loan.term}</span>
                  <span>Trust: {loan.trustScore}%</span>
                </div>
                <p className="text-sm font-medium mt-1">{loan.borrower}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Finance Tips */}
        <Card className="card-elevated p-6 bg-[var(--gradient-secondary)] text-secondary-foreground">
          <h3 className="font-heading font-semibold mb-2">💡 Today's Tip</h3>
          <p className="text-sm">
            Diversify your lending portfolio across different risk levels to maximize returns while minimizing exposure.
          </p>
        </Card>
      </div>
    </div>
  );
}