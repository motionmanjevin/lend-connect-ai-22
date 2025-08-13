import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, CreditCard, Building2, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AccountType = "mobile" | "card" | "bank";

const accountTypes = [
  {
    id: "mobile" as AccountType,
    label: "Mobile Money",
    icon: Smartphone,
    description: "Withdraw to mobile money account"
  },
  {
    id: "bank" as AccountType,
    label: "Bank Account",
    icon: Building2,
    description: "Withdraw to bank account"
  },
  {
    id: "card" as AccountType,
    label: "Debit Card",
    icon: CreditCard,
    description: "Withdraw to debit card"
  }
];

const mobileProviders = [
  { value: "mtn", label: "MTN Mobile Money" },
  { value: "airtel", label: "Airtel Money" },
  { value: "vodafone", label: "Vodafone Cash" },
  { value: "tigo", label: "Tigo Cash" }
];

export function WithdrawModal({ open, onOpenChange }: WithdrawModalProps) {
  const [selectedAccount, setSelectedAccount] = useState<AccountType | null>(null);
  const [amount, setAmount] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const availableBalance = profile?.account_balance || 0;

  useEffect(() => {
    if (user && open) {
      fetchProfile();
    }
  }, [user, open]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedAccount || !amount || !user) {
      toast({
        title: "Missing Information",
        description: "Please select an account type and enter an amount.",
        variant: "destructive"
      });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive"
      });
      return;
    }

    if (withdrawAmount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You cannot withdraw more than your available balance.",
        variant: "destructive"
      });
      return;
    }

    // Validate specific account type requirements
    if (selectedAccount === "mobile" && (!mobileNumber || !provider)) {
      toast({
        title: "Missing Mobile Details",
        description: "Please enter your mobile number and select a provider.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current user profile to get current balance
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('account_balance')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const currentBalance = Number(currentProfile.account_balance) || 0;
      const newBalance = currentBalance - withdrawAmount;

      // Ensure we don't go below zero
      if (newBalance < 0) {
        throw new Error("Insufficient balance for withdrawal");
      }

      // Create withdrawal transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: withdrawAmount,
          transaction_type: 'withdrawal',
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      // Update user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ account_balance: newBalance })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Withdrawal Successful",
        description: `₵${amount} has been withdrawn from your account. Funds will be transferred within 1-3 business days.`,
      });

      // Close modal and reset loading immediately for responsiveness
      setIsLoading(false);
      onOpenChange(false);

      // Reset form after modal closes
      setTimeout(() => {
        setSelectedAccount(null);
        setAmount("");
        setMobileNumber("");
        setProvider("");
        setCardNumber("");
        setBankAccount("");
        setRoutingNumber("");
        setBankName("");
      }, 100);
      
      // Trigger a custom event to notify parent components
      window.dispatchEvent(new CustomEvent('balanceUpdate'));
      
      
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSelect = (account: AccountType) => {
    setSelectedAccount(account);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md pointer-events-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Withdraw Funds</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Available Balance */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Available Balance</span>
              <span className="text-lg font-semibold text-primary">₵{availableBalance.toFixed(2)}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₵</span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                max={availableBalance}
              />
            </div>
            {amount && parseFloat(amount) > availableBalance && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Amount exceeds available balance</span>
              </div>
            )}
          </div>

          {/* Account Type Selection */}
          <div className="space-y-3">
            <Label>Withdraw To</Label>
            <div className="grid gap-3">
              {accountTypes.map((account) => {
                const Icon = account.icon;
                const isSelected = selectedAccount === account.id;
                return (
                  <Card
                    key={account.id}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleAccountSelect(account.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">{account.label}</p>
                          <p className="text-sm text-muted-foreground">{account.description}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Account Details Forms */}
          {selectedAccount === "mobile" && (
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
              <h4 className="font-medium">Mobile Money Account</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="provider">Service Provider</Label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {mobileProviders.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="+1234567890"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedAccount === "card" && (
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
              <h4 className="font-medium">Debit Card Details</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Only debit cards are supported for withdrawals
                </div>
              </div>
            </div>
          )}

          {selectedAccount === "bank" && (
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
              <h4 className="font-medium">Bank Account Details</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    type="text"
                    placeholder="Bank of America"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Account Number</Label>
                  <Input
                    id="bankAccount"
                    type="text"
                    placeholder="123456789"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routing">Routing Number</Label>
                  <Input
                    id="routing"
                    type="text"
                    placeholder="987654321"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleWithdraw} 
              className="flex-1"
              disabled={!amount || parseFloat(amount) > availableBalance || isLoading}
            >
              {isLoading ? "Processing..." : `Withdraw ₵${amount || "0.00"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}