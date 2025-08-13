import { useState, useEffect } from "react";
import { Edit, Settings, Shield, CreditCard, Bell, HelpCircle, LogOut, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const profileData = {
  name: "John Doe",
  email: "john.doe@email.com",
  phone: "+1 (555) 123-4567",
  avatar: "JD",
  trustScore: 92,
  joinDate: "March 2023",
  totalLent: 25000,
  totalBorrowed: 8500,
  activeLoans: 4,
  verification: {
    identity: true,
    income: true,
    address: true,
    phone: true
  }
};

const paymentMethods = [
  { type: "Bank Account", last4: "1234", primary: true, icon: "🏦" },
  { type: "PayPal", email: "john.doe@email.com", primary: false, icon: "💳" },
  { type: "Mobile Money", last4: "5678", primary: false, icon: "📱" }
];

const preferences = [
  { label: "Push Notifications", description: "Loan updates and reminders", enabled: true },
  { label: "Email Notifications", description: "Weekly summaries and promotions", enabled: true },
  { label: "SMS Alerts", description: "Payment due dates and approvals", enabled: false },
  { label: "Investment Opportunities", description: "New loan recommendations", enabled: true }
];

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Reset scroll position on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      navigate("/auth");
    }
  }, [user, navigate]);

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
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const adjustBalance = async (amount: number) => {
    if (!user || !profile) return;
    
    const currentBalance = profile.account_balance || 0;
    const newBalance = currentBalance + amount;
    
    // Prevent negative balance
    if (newBalance < 0) {
      alert("Cannot reduce balance below zero");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          account_balance: newBalance 
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Refresh profile data
      await fetchProfile();
      
      // Trigger balance update event for other components
      window.dispatchEvent(new CustomEvent('balanceUpdate'));
      
      alert(`Balance ${amount > 0 ? 'increased' : 'decreased'} by ₵${Math.abs(amount)}`);
    } catch (error: any) {
      alert(`Error adjusting balance: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 bg-[var(--gradient-hero)] text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <span className="font-heading font-bold text-2xl">{profileData.avatar}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-white">
              <Shield className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-xl">{profile?.full_name || 'User'}</h1>
            <p className="text-white/80 text-sm">{profile?.email}</p>
            <p className="text-white/80 text-xs">Member since {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        {/* Trust Score */}
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">Trust Score</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-secondary fill-current" />
              <span className="font-bold text-lg">{profileData.trustScore}%</span>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-secondary h-2 rounded-full"
              style={{ width: `${profileData.trustScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-4 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="card-elevated p-3 text-center">
            <p className="text-lg font-bold text-success">₵{profile?.account_balance?.toFixed(2) || '0.00'}</p>
            <p className="text-muted-foreground text-xs">Balance</p>
          </Card>
          <Card className="card-elevated p-3 text-center">
            <p className="text-lg font-bold text-accent">₵0.00</p>
            <p className="text-muted-foreground text-xs">Total Borrowed</p>
          </Card>
          <Card className="card-elevated p-3 text-center">
            <p className="text-lg font-bold text-primary">0</p>
            <p className="text-muted-foreground text-xs">Active Loans</p>
          </Card>
        </div>

        {/* Manual Balance Adjustment - Admin Controls */}
        <Card className="card-elevated p-4">
          <h3 className="font-heading font-semibold mb-3">Manual Balance Adjustment</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => adjustBalance(10)}
                className="flex-1"
              >
                Add ₵10
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => adjustBalance(50)}
                className="flex-1"
              >
                Add ₵50
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => adjustBalance(100)}
                className="flex-1"
              >
                Add ₵100
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => adjustBalance(-10)}
                className="flex-1 text-destructive hover:text-destructive"
              >
                Subtract ₵10
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => adjustBalance(-50)}
                className="flex-1 text-destructive hover:text-destructive"
              >
                Subtract ₵50
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => adjustBalance(-100)}
                className="flex-1 text-destructive hover:text-destructive"
              >
                Subtract ₵100
              </Button>
            </div>
          </div>
        </Card>

        {/* Verification Status */}
        <Card className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-success" />
            <h3 className="font-heading font-semibold">Verification Status</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(profileData.verification).map(([key, verified]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm capitalize">{key}</span>
                <Badge className={verified ? "status-success" : "status-warning"}>
                  {verified ? "Verified" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="card-elevated p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-semibold">Payment Methods</h3>
            </div>
            <Button variant="outline" size="sm">
              Add New
            </Button>
          </div>
          <div className="space-y-3">
            {paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{method.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{method.type}</p>
                    <p className="text-muted-foreground text-xs">
                      {"last4" in method ? `****${method.last4}` : method.email}
                    </p>
                  </div>
                </div>
                {method.primary && (
                  <Badge variant="outline" className="text-xs">
                    Primary
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Preferences */}
        <Card className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-semibold">Notification Preferences</h3>
          </div>
          <div className="space-y-4">
            {preferences.map((pref, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{pref.label}</p>
                  <p className="text-muted-foreground text-xs">{pref.description}</p>
                </div>
                <Switch checked={pref.enabled} />
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start h-12">
            <Settings className="w-4 h-4 mr-3" />
            Account Settings
          </Button>
          <Button variant="outline" className="w-full justify-start h-12">
            <Award className="w-4 h-4 mr-3" />
            Loan Agreements
          </Button>
          <Button variant="outline" className="w-full justify-start h-12">
            <HelpCircle className="w-4 h-4 mr-3" />
            Help & Support
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start h-12 text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}