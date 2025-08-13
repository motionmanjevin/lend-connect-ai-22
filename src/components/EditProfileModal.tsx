import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  email?: string;
  primary: boolean;
  icon: string;
}

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: any;
  onUpdate: () => void;
}

export default function EditProfileModal({ open, onClose, profile, onUpdate }: EditProfileModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || "");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    profile?.payment_methods || []
  );
  const [loading, setLoading] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "",
    identifier: "",
    primary: false
  });
  const { toast } = useToast();

  const paymentTypeIcons = {
    "Bank Account": "🏦",
    "PayPal": "💳",
    "Mobile Money": "📱",
    "Credit Card": "💳",
    "Debit Card": "💳"
  };

  const addPaymentMethod = () => {
    if (!newPaymentMethod.type || !newPaymentMethod.identifier) {
      toast({
        title: "Error",
        description: "Please fill in all payment method fields",
        variant: "destructive"
      });
      return;
    }

    const newMethod: PaymentMethod = {
      id: crypto.randomUUID(),
      type: newPaymentMethod.type,
      ...(newPaymentMethod.type === "PayPal" 
        ? { email: newPaymentMethod.identifier }
        : { last4: newPaymentMethod.identifier.slice(-4) }
      ),
      primary: paymentMethods.length === 0 || newPaymentMethod.primary,
      icon: paymentTypeIcons[newPaymentMethod.type as keyof typeof paymentTypeIcons] || "💳"
    };

    // If setting as primary, make others non-primary
    let updatedMethods = paymentMethods;
    if (newMethod.primary) {
      updatedMethods = paymentMethods.map(method => ({ ...method, primary: false }));
    }

    setPaymentMethods([...updatedMethods, newMethod]);
    setNewPaymentMethod({ type: "", identifier: "", primary: false });
  };

  const removePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
  };

  const setPrimary = (id: string) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      primary: method.id === id
    })));
  };

  const handleSave = async () => {
    if (!profile?.user_id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone_number: phoneNumber,
          payment_methods: JSON.parse(JSON.stringify(paymentMethods))
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
      onUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+233 XX XXX XXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <Label>Payment Methods</Label>
            
            {/* Existing Payment Methods */}
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <Card key={method.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{method.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{method.type}</p>
                        <p className="text-muted-foreground text-xs">
                          {"last4" in method && method.last4 ? `****${method.last4}` : method.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.primary && (
                        <Badge variant="outline" className="text-xs">Primary</Badge>
                      )}
                      {!method.primary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPrimary(method.id)}
                          className="text-xs"
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePaymentMethod(method.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Add New Payment Method */}
            <Card className="p-3 border-dashed">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={newPaymentMethod.type}
                    onValueChange={(value) => setNewPaymentMethod(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Account">Bank Account</SelectItem>
                      <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Debit Card">Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder={newPaymentMethod.type === "PayPal" ? "Email" : "Number"}
                    value={newPaymentMethod.identifier}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, identifier: e.target.value }))}
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addPaymentMethod}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
