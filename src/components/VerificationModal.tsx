import { useState } from "react";
import { CheckCircle, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  listingTitle: string;
}

export default function VerificationModal({ isOpen, onClose, onVerified, listingTitle }: VerificationModalProps) {
  const [step, setStep] = useState<"identity" | "success">("identity");
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    idNumber: "",
    phoneNumber: "",
    pin: ""
  });
  const { toast } = useToast();

  const handleVerification = async () => {
    if (!formData.idNumber || !formData.phoneNumber || !formData.pin) {
      toast({
        title: "Missing Information",
        description: "Please fill in all verification fields.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      setStep("success");
      toast({
        title: "Verification Successful",
        description: "Your offer has been sent successfully.",
      });
    }, 2000);
  };

  const handleComplete = () => {
    onVerified();
    onClose();
    setStep("identity");
    setFormData({ idNumber: "", phoneNumber: "", pin: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {step === "identity" ? "Verify Your Identity" : "Offer Sent Successfully"}
          </DialogTitle>
        </DialogHeader>

        {step === "identity" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To send an offer for "{listingTitle}", we need to verify your identity for security purposes.
            </p>

            <div className="space-y-3">
              <div>
                <Label htmlFor="idNumber">National ID Number</Label>
                <Input
                  id="idNumber"
                  placeholder="Enter your national ID number"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="pin">Security PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter your 4-digit PIN"
                  maxLength={4}
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Your information is encrypted and secure
              </span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleVerification} 
                disabled={isVerifying}
                className="flex-1"
              >
                {isVerifying ? "Verifying..." : "Verify & Send Offer"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Offer Sent Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                Your offer for "{listingTitle}" has been sent to the borrower. 
                You'll receive a notification when they respond.
              </p>
            </div>

            <Button onClick={handleComplete} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}