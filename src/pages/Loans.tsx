import { useState, useEffect } from "react";
import { TrendingUp, Clock, DollarSign, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const borrowingLoans = [
  {
    id: 1,
    amount: 5000,
    purpose: "Home Renovation",
    lender: "Investment Group A",
    rate: 8.5,
    term: 24,
    monthlyPayment: 228,
    nextPayment: "2024-01-15",
    remainingBalance: 4200,
    status: "active",
    paymentsLeft: 18
  }
];

const lendingLoans = [
  {
    id: 1,
    borrower: "Sarah Martinez",
    amount: 3000,
    purpose: "Education",
    rate: 7.2,
    term: 18,
    monthlyReturn: 185,
    nextReturn: "2024-01-10",
    totalEarned: 740,
    status: "active",
    paymentsLeft: 12
  },
  {
    id: 2,
    borrower: "Mike Johnson",
    amount: 2500,
    purpose: "Car Repair",
    rate: 9.1,
    term: 12,
    monthlyReturn: 0,
    nextReturn: null,
    totalEarned: 341,
    status: "completed",
    paymentsLeft: 0
  }
];

const pastLoans = [
  {
    id: 1,
    type: "borrowing",
    amount: 3500,
    purpose: "Education",
    finalRate: 6.8,
    completedDate: "2023-12-20",
    totalPaid: 3738,
    performance: "On Time"
  },
  {
    id: 2,
    type: "lending",
    borrower: "Tech Startup",
    amount: 8000,
    finalRate: 11.5,
    completedDate: "2023-11-15",
    totalEarned: 1840,
    performance: "Early Repayment"
  }
];

export default function Loans() {
  const [activeTab, setActiveTab] = useState("borrowing");

  // Reset scroll position on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "status-success";
      case "overdue": return "bg-destructive/10 text-destructive border border-destructive/20";
      case "completed": return "status-info";
      default: return "status-warning";
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "On Time": return "text-success";
      case "Early Repayment": return "text-info";
      case "Late Payment": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border">
        <h1 className="font-heading font-bold text-xl mb-4">My Loans</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="card-elevated p-4 text-center">
            <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-lg font-bold">$740</p>
            <p className="text-muted-foreground text-xs">Total Earned</p>
          </Card>
          <Card className="card-elevated p-4 text-center">
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-lg font-bold">$4,200</p>
            <p className="text-muted-foreground text-xs">Balance Owed</p>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="borrowing">Borrowing</TabsTrigger>
          <TabsTrigger value="lending">Lending</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Borrowing Tab */}
        <TabsContent value="borrowing" className="space-y-4 mt-4">
          {borrowingLoans.map((loan) => (
            <Card key={loan.id} className="card-elevated p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">${loan.amount.toLocaleString()}</h3>
                  <p className="text-muted-foreground text-sm">{loan.purpose}</p>
                  <p className="text-muted-foreground text-xs">from {loan.lender}</p>
                </div>
                <Badge className={`${getStatusColor(loan.status)} rounded-full`}>
                  {loan.status}
                </Badge>
              </div>

              <div className="space-y-3">
                {/* Payment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Payment</p>
                    <p className="font-bold">${loan.monthlyPayment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="font-bold">${loan.remainingBalance.toLocaleString()}</p>
                  </div>
                </div>

                {/* Next Payment */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">Next Payment Due</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{loan.nextPayment}</p>
                  <p className="text-lg font-bold text-accent">${loan.monthlyPayment}</p>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-muted-foreground">{loan.paymentsLeft} payments left</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-[var(--gradient-accent)] h-2 rounded-full"
                      style={{ width: `${((loan.term - loan.paymentsLeft) / loan.term) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="btn-hero flex-1">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Pay Now
                  </Button>
                  <Button variant="outline" size="sm">
                    Request Extension
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Lending Tab */}
        <TabsContent value="lending" className="space-y-4 mt-4">
          {lendingLoans.map((loan) => (
            <Card key={loan.id} className="card-elevated p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">${loan.amount.toLocaleString()}</h3>
                  <p className="text-muted-foreground text-sm">to {loan.borrower}</p>
                  <p className="text-muted-foreground text-xs">{loan.purpose}</p>
                </div>
                <Badge className={`${getStatusColor(loan.status)} rounded-full`}>
                  {loan.status}
                </Badge>
              </div>

              <div className="space-y-3">
                {/* Return Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Return</p>
                    <p className="font-bold text-success">
                      {loan.status === "active" ? `$${loan.monthlyReturn}` : "Completed"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="font-bold text-success">${loan.totalEarned}</p>
                  </div>
                </div>

                {/* ROI Display */}
                <div className="bg-success/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success">ROI Performance</span>
                  </div>
                  <p className="text-lg font-bold text-success">{loan.rate}% APR</p>
                  {loan.status === "active" && (
                    <p className="text-sm text-muted-foreground">
                      Next payment: {loan.nextReturn}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {loan.status === "active" && (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      Early Exit
                    </Button>
                    <Button variant="outline" size="sm">
                      Withdraw Returns
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4 mt-4">
          {pastLoans.map((loan) => (
            <Card key={loan.id} className="card-elevated p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">${loan.amount.toLocaleString()}</h3>
                  <p className="text-muted-foreground text-sm">
                    {loan.type === "borrowing" ? loan.purpose : `to ${loan.borrower}`}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Completed: {loan.completedDate}
                  </p>
                </div>
                <Badge className={`${loan.type === "borrowing" ? "bg-accent/10 text-accent" : "bg-success/10 text-success"} rounded-full`}>
                  {loan.type === "borrowing" ? "Borrowed" : "Lent"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Final Rate</p>
                  <p className="font-bold">{loan.finalRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {loan.type === "borrowing" ? "Total Paid" : "Total Earned"}
                  </p>
                  <p className="font-bold">
                    ${loan.type === "borrowing" ? loan.totalPaid : loan.totalEarned}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className={`text-sm font-medium ${getPerformanceColor(loan.performance)}`}>
                  {loan.performance}
                </span>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}