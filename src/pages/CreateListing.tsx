import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Banknote, Camera, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function CreateListing() {
  const navigate = useNavigate();
  const [listingType, setListingType] = useState<"borrow" | "lend" | null>(null);

  // Reset scroll position on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    duration: "",
    rate: "",
    story: "",
    location: "",
    collateral: ""
  });

  const handleTypeSelection = (type: "borrow" | "lend") => {
    setListingType(type);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 1) {
      navigate(-1);
    } else if (step === 2 && listingType) {
      setStep(1);
      setListingType(null);
    } else {
      setStep(step - 1);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleSubmit = () => {
    // Handle submission logic here
    console.log("Submitting:", { listingType, ...formData });
    navigate("/marketplace");
  };

  if (!listingType) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="p-4 bg-card border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-heading font-bold text-xl">Create Listing</h1>
          </div>
        </div>

        {/* Type Selection */}
        <div className="p-4 space-y-4">
          <div className="text-center mb-8">
            <h2 className="font-heading font-bold text-2xl mb-2">What would you like to do?</h2>
            <p className="text-muted-foreground">Choose how you want to participate in the marketplace</p>
          </div>

          <Card className="card-interactive p-6" onClick={() => handleTypeSelection("borrow")}>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">Request a Loan</h3>
              <p className="text-muted-foreground text-sm">Create a borrowing request and get funded by lenders</p>
              <Badge className="mt-3 bg-primary/10 text-primary">For Borrowers</Badge>
            </div>
          </Card>

          <Card className="card-interactive p-6" onClick={() => handleTypeSelection("lend")}>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Banknote className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">Offer to Lend</h3>
              <p className="text-muted-foreground text-sm">Create a lending offer and help borrowers achieve their goals</p>
              <Badge className="mt-3 bg-secondary/10 text-secondary">For Lenders</Badge>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-heading font-bold text-xl">
            {listingType === "borrow" ? "Request Loan" : "Offer to Lend"}
          </h1>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`h-2 rounded-full flex-1 transition-all duration-300 ${
                num <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-6">
        {step === 2 && (
          <>
            <div>
              <h2 className="font-heading font-bold text-xl mb-2">
                {listingType === "borrow" ? "How much do you need?" : "How much can you lend?"}
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                {listingType === "borrow" 
                  ? "Enter the amount you'd like to borrow"
                  : "Enter the maximum amount you're willing to lend"
                }
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Amount (GHC)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="text-2xl h-14"
                />
              </div>

              {listingType === "borrow" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Purpose</label>
                  <Input
                    placeholder="e.g., Business expansion, Education, Home renovation"
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Duration (months)</label>
                <Input
                  type="number"
                  placeholder="12"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {listingType === "borrow" ? "Maximum Interest Rate (%)" : "Interest Rate (%)"}
                </label>
                <Input
                  type="number"
                  placeholder="8.5"
                  value={formData.rate}
                  onChange={(e) => setFormData({...formData, rate: e.target.value})}
                />
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="font-heading font-bold text-xl mb-2">Tell your story</h2>
              <p className="text-muted-foreground text-sm mb-4">
                {listingType === "borrow" 
                  ? "Explain why you need this loan and how it will help you"
                  : "Share your lending philosophy and what you look for in borrowers"
                }
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Story</label>
                <Textarea
                  placeholder={listingType === "borrow" 
                    ? "Share your story, plans, and how this loan will impact your life..."
                    : "Describe your lending criteria, risk tolerance, and what motivates you to lend..."
                  }
                  value={formData.story}
                  onChange={(e) => setFormData({...formData, story: e.target.value})}
                  rows={6}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="City, Region"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              {listingType === "borrow" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Collateral (Optional)</label>
                  <Input
                    placeholder="e.g., Car title, Property deed, Business equipment"
                    value={formData.collateral}
                    onChange={(e) => setFormData({...formData, collateral: e.target.value})}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <h2 className="font-heading font-bold text-xl mb-2">Review & Submit</h2>
              <p className="text-muted-foreground text-sm mb-4">Please review your listing before submitting</p>
            </div>

            <Card className="card-elevated p-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge className={listingType === "borrow" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}>
                  {listingType === "borrow" ? "Loan Request" : "Loan Offer"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">GHC {Number(formData.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-semibold">{formData.duration} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate</span>
                <span className="font-semibold">{formData.rate}%</span>
              </div>
              {formData.purpose && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purpose</span>
                  <span className="font-semibold">{formData.purpose}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-semibold">{formData.location}</span>
              </div>
            </Card>

            <div className="space-y-3">
              <Button className="w-full btn-hero h-12" onClick={handleSubmit}>
                {listingType === "borrow" ? "Submit Loan Request" : "Submit Loan Offer"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setStep(3)}>
                Back to Edit
              </Button>
            </div>
          </>
        )}

        {step < 4 && step > 1 && (
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border">
            <Button className="w-full btn-hero h-12" onClick={handleNext}>
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}