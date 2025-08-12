import { useState } from "react";
import { ArrowLeft, DollarSign, Calendar, FileText, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

type ListingType = "borrow" | "lend" | null;

const loanPurposes = [
  "Business Expansion",
  "Education",
  "Home Renovation",
  "Medical Expenses",
  "Debt Consolidation",
  "Emergency Fund",
  "Equipment Purchase",
  "Other"
];

const repaymentTerms = [
  { label: "3 months", value: "3" },
  { label: "6 months", value: "6" },
  { label: "12 months", value: "12" },
  { label: "18 months", value: "18" },
  { label: "24 months", value: "24" },
  { label: "36 months", value: "36" }
];

export default function CreateListing() {
  const navigate = useNavigate();
  const [listingType, setListingType] = useState<ListingType>(null);
  const [formData, setFormData] = useState({
    amount: "",
    rate: "",
    term: "",
    purpose: "",
    description: "",
    minAmount: "",
    maxAmount: ""
  });

  const handleBack = () => {
    if (listingType) {
      setListingType(null);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log("Submitting listing:", { type: listingType, ...formData });
    navigate("/marketplace");
  };

  if (!listingType) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mr-2 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-heading font-bold text-xl">Create Listing</h1>
          </div>

          <div className="space-y-4">
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30"
              onClick={() => setListingType("borrow")}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">I Need to Borrow</h3>
                <p className="text-muted-foreground text-sm">
                  Create a borrowing request and connect with lenders
                </p>
              </div>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-secondary/30"
              onClick={() => setListingType("lend")}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">I Want to Lend</h3>
                <p className="text-muted-foreground text-sm">
                  Offer your money to borrowers and earn returns
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mr-2 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading font-bold text-xl">
            {listingType === "borrow" ? "Borrowing Request" : "Lending Offer"}
          </h1>
        </div>

        <div className="space-y-6">
          {listingType === "borrow" ? (
            // Borrowing Form
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount Needed</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="amount"
                      placeholder="5,000"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="rate">Interest Rate Willing to Pay (%)</Label>
                  <Input
                    id="rate"
                    placeholder="8.5"
                    value={formData.rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="term">Repayment Term</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, term: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {repaymentTerms.map((term) => (
                        <SelectItem key={term.value} value={term.value}>
                          {term.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="purpose">Loan Purpose</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {loanPurposes.map((purpose) => (
                        <SelectItem key={purpose} value={purpose}>
                          {purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell lenders about your request..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </>
          ) : (
            // Lending Form
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minAmount">Min Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="minAmount"
                        placeholder="1,000"
                        value={formData.minAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, minAmount: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="maxAmount">Max Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="maxAmount"
                        placeholder="50,000"
                        value={formData.maxAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxAmount: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="rate">Interest Rate Offered (%)</Label>
                  <Input
                    id="rate"
                    placeholder="7.5"
                    value={formData.rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="term">Maximum Term</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, term: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select max term" />
                    </SelectTrigger>
                    <SelectContent>
                      {repaymentTerms.map((term) => (
                        <SelectItem key={term.value} value={term.value}>
                          {term.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Lending Terms</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your lending criteria and requirements..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </>
          )}

          <Button onClick={handleSubmit} className="w-full btn-hero">
            <FileText className="w-4 h-4 mr-2" />
            Create {listingType === "borrow" ? "Borrowing Request" : "Lending Offer"}
          </Button>
        </div>
      </div>
    </div>
  );
}