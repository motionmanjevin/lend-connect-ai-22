import { useState } from "react";
import { ArrowLeft, DollarSign, Calendar, FileText, Camera, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const loanPurposes = [
  "Personal", "Education", "Home Improvement", "Business", "Medical", "Car", "Debt Consolidation", "Other"
];

const repaymentOptions = [
  { value: "weekly", label: "Weekly", description: "Lower amount, more frequent" },
  { value: "monthly", label: "Monthly", description: "Standard option" },
  { value: "income", label: "Income-based", description: "Flexible payments" }
];

export default function RequestLoan() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: "",
    duration: "",
    purpose: "",
    repaymentType: "monthly",
    story: "",
    hasVideo: false
  });

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/");
    }
  };

  const handleSubmit = () => {
    // TODO: Submit loan request
    console.log("Loan request submitted:", formData);
    navigate("/");
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-heading font-bold text-lg">Request Loan</h1>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                step <= currentStep ? "bg-[var(--gradient-primary)]" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className="text-muted-foreground text-sm mt-2">Step {currentStep} of 6</p>
      </div>

      <div className="p-4">
        {/* Step 1: Amount & Duration */}
        {currentStep === 1 && (
          <Card className="card-elevated p-6 animate-fade-in">
            <div className="text-center mb-6">
              <DollarSign className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="font-heading font-bold text-xl mb-2">How much do you need?</h2>
              <p className="text-muted-foreground">Tell us your loan amount and preferred duration</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Loan Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="5,000"
                  value={formData.amount}
                  onChange={(e) => updateFormData("amount", e.target.value)}
                  className="text-center text-lg font-bold"
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (months)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="24"
                  value={formData.duration}
                  onChange={(e) => updateFormData("duration", e.target.value)}
                  className="text-center text-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {["12", "24", "36"].map((months) => (
                  <Button
                    key={months}
                    variant="outline"
                    size="sm"
                    onClick={() => updateFormData("duration", months)}
                    className={formData.duration === months ? "bg-primary text-primary-foreground" : ""}
                  >
                    {months} months
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Purpose */}
        {currentStep === 2 && (
          <Card className="card-elevated p-6 animate-fade-in">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="font-heading font-bold text-xl mb-2">What's the purpose?</h2>
              <p className="text-muted-foreground">Help lenders understand your needs</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {loanPurposes.map((purpose) => (
                <Button
                  key={purpose}
                  variant={formData.purpose === purpose ? "default" : "outline"}
                  className="h-12"
                  onClick={() => updateFormData("purpose", purpose)}
                >
                  {purpose}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Step 3: Repayment Plan */}
        {currentStep === 3 && (
          <Card className="card-elevated p-6 animate-fade-in">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="font-heading font-bold text-xl mb-2">Repayment Plan</h2>
              <p className="text-muted-foreground">Choose what works best for you</p>
            </div>

            <div className="space-y-3">
              {repaymentOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`card-interactive p-4 cursor-pointer transition-all ${
                    formData.repaymentType === option.value ? "ring-2 ring-primary bg-primary/5" : ""
                  }`}
                  onClick={() => updateFormData("repaymentType", option.value)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.repaymentType === option.value ? "bg-primary border-primary" : "border-muted-foreground"
                    }`} />
                    <div>
                      <h3 className="font-semibold">{option.label}</h3>
                      <p className="text-muted-foreground text-sm">{option.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Step 4: Story */}
        {currentStep === 4 && (
          <Card className="card-elevated p-6 animate-fade-in">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="font-heading font-bold text-xl mb-2">Tell Your Story</h2>
              <p className="text-muted-foreground">Share why this loan matters to you</p>
            </div>

            <div className="space-y-4">
              <Textarea
                placeholder="Tell lenders about your goals, how you'll use the funds, and why you're a good investment..."
                value={formData.story}
                onChange={(e) => updateFormData("story", e.target.value)}
                className="min-h-[120px]"
              />

              <Card className="card-interactive p-4 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Camera className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Add Video (Optional)</h3>
                    <p className="text-muted-foreground text-sm">Personal videos get 3x more funding</p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        )}

        {/* Step 5: AI Suggestions */}
        {currentStep === 5 && (
          <Card className="card-elevated p-6 animate-fade-in">
            <div className="text-center mb-6">
              <Zap className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="font-heading font-bold text-xl mb-2">AI Recommendations</h2>
              <p className="text-muted-foreground">Our AI suggests optimal terms for your loan</p>
            </div>

            <div className="space-y-4">
              <Card className="bg-[var(--gradient-hero)] text-white p-4">
                <h3 className="font-heading font-semibold mb-2">Recommended Terms</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/80 text-sm">Suggested Rate</p>
                    <p className="text-xl font-bold">8.5% APR</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Expected Funding</p>
                    <p className="text-xl font-bold">3-5 days</p>
                  </div>
                </div>
              </Card>

              <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                <h4 className="font-semibold text-info mb-2">💡 AI Tips</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Your credit profile suggests rates between 7.5% - 9.5%</li>
                  <li>• Adding collateral could reduce your rate by 1-2%</li>
                  <li>• Similar loans in your area fund 85% faster</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Step 6: Preview & Submit */}
        {currentStep === 6 && (
          <Card className="card-elevated p-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="font-heading font-bold text-xl mb-2">Review Your Request</h2>
              <p className="text-muted-foreground">Make sure everything looks correct</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Amount</p>
                  <p className="font-bold text-lg">${formData.amount ? parseInt(formData.amount).toLocaleString() : "0"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Duration</p>
                  <p className="font-bold text-lg">{formData.duration} months</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm">Purpose</p>
                <p className="font-semibold">{formData.purpose}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm">Repayment</p>
                <p className="font-semibold capitalize">{formData.repaymentType}</p>
              </div>

              {formData.story && (
                <div>
                  <p className="text-muted-foreground text-sm">Your Story</p>
                  <p className="text-sm leading-relaxed">{formData.story}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            className="btn-hero flex-1"
            onClick={currentStep === 6 ? handleSubmit : handleNext}
          >
            {currentStep === 6 ? "Submit Request" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}