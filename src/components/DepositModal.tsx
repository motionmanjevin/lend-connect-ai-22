import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, CreditCard, Building2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Load Paystack inline script
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: any) => {
        openIframe: () => void;
      };
    };
  }
}

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PaymentMethod = "mobile" | "card" | "bank";

const paymentMethods = [
  {
    id: "mobile" as PaymentMethod,
    label: "Mobile Money",
    icon: Smartphone,
    description: "Pay using mobile money"
  },
  {
    id: "card" as PaymentMethod,
    label: "Card Payment",
    icon: CreditCard,
    description: "Pay with debit/credit card"
  },
  {
    id: "bank" as PaymentMethod,
    label: "Bank Transfer",
    icon: Building2,
    description: "Direct bank transfer"
  }
];

const mobileProviders = [
  { value: "mtn", label: "MTN Mobile Money" },
  { value: "airtel", label: "Airtel Money" },
  { value: "vodafone", label: "Vodafone Cash" },
  { value: "tigo", label: "Tigo Cash" }
];

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paystackKey, setPaystackKey] = useState<string>("");
  const { toast } = useToast();
  const { user } = useAuth();

  // Load Paystack script and get public key
  useEffect(() => {
    const loadPaystack = () => {
      if (!document.querySelector('script[src*="paystack"]')) {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        document.head.appendChild(script);
      }
    };

    // Get Paystack public key from Supabase function
    const getPaystackKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-paystack-key');
        if (error) throw error;
        setPaystackKey(data.public_key);
      } catch (error) {
        console.error('Error getting Paystack key:', error);
        toast({
          title: "Configuration Error",
          description: "Unable to load payment configuration. Please try again.",
          variant: "destructive"
        });
      }
    };

    loadPaystack();
    getPaystackKey();
  }, [toast]);

  const handleDeposit = async () => {
    if (!selectedMethod || !amount || !user || !paystackKey) {
      toast({
        title: "Missing Information",
        description: "Please select a payment method and enter an amount.",
        variant: "destructive"
      });
      return;
    }

    if (!window.PaystackPop) {
      toast({
        title: "Payment Service Loading",
        description: "Please wait for payment service to load and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create transaction record first
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'deposit',
          amount: parseFloat(amount),
          currency: 'GHS',
          status: 'pending'
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Configure Paystack popup
      const paystack = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount: parseFloat(amount) * 100, // Paystack expects amount in pesewas (kobo for Naira)
        currency: 'GHS',
        ref: `lend_me_${transaction.id}_${Date.now()}`,
        metadata: {
          payment_method: selectedMethod,
          transaction_id: transaction.id,
          user_id: user.id
        },
        callback: function(response: any) {
          console.log('Payment successful:', response);
          
          // Update transaction status (non-blocking)
          const updateTransaction = async () => {
            try {
              const { error } = await supabase
                .from('transactions')
                .update({ 
                  status: 'completed',
                  paystack_reference: response.reference 
                })
                .eq('id', transaction.id);

              if (error) throw error;

              toast({
                title: "Payment Successful!",
                description: `₵${amount} has been deposited to your account.`,
              });

              onOpenChange(false);
              setIsLoading(false);
              
              // Trigger a custom event to notify parent components
              window.dispatchEvent(new CustomEvent('balanceUpdate'));
              
              // Also reload as backup
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } catch (error) {
              console.error('Error updating transaction:', error);
              toast({
                title: "Payment Successful!",
                description: `₵${amount} has been deposited. Please refresh to see updated balance.`,
              });
              onOpenChange(false);
              setIsLoading(false);
            }
          };

          updateTransaction();
        },
        onClose: function() {
          toast({
            title: "Payment Cancelled",
            description: "Payment was cancelled. You can try again.",
            variant: "destructive"
          });
          setIsLoading(false);
        }
      });

      // Open the payment popup
      paystack.openIframe();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Deposit Funds</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₵</span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <div className="grid gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <Card
                    key={method.id}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleMethodSelect(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">{method.label}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
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

          {/* Payment Details Forms */}
          {selectedMethod === "mobile" && (
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
              <h4 className="font-medium">Mobile Money Details</h4>
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

          {selectedMethod === "card" && (
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
              <h4 className="font-medium">Card Details</h4>
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === "bank" && (
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
              <h4 className="font-medium">Bank Transfer Details</h4>
              <div className="space-y-3">
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
            <Button onClick={handleDeposit} disabled={isLoading} className="flex-1">
              {isLoading ? "Processing..." : `Deposit ₵${amount || "0.00"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}