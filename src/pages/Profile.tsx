import { useState, useEffect } from "react";
import { Edit, Settings, Shield, CreditCard, Bell, HelpCircle, LogOut, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import EditProfileModal from "@/components/EditProfileModal";

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
  const [editModalOpen, setEditModalOpen] = useState(false);
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
    
    const currentBalance = Number(profile.account_balance) || 0;
    const newBalance = currentBalance + amount;
    
    // Prevent negative balance
    if (newBalance < 0) {
      alert("Cannot reduce balance below zero");
      return;
    }
    
    try {
      console.log('Updating balance for user:', user.id, 'from', currentBalance, 'to', newBalance);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          account_balance: newBalance 
        })
        .eq('user_id', user.id)
        .select();
      
      if (error) {
        console.error('Database update error:', error);
        throw error;
      }
      
      console.log('Update successful, data returned:', data);
      
      // Refresh profile data
      await fetchProfile();
      
      // Trigger balance update event for other components
      window.dispatchEvent(new CustomEvent('balanceUpdate'));
      
      alert(`Balance ${amount > 0 ? 'increased' : 'decreased'} by GHC ${Math.abs(amount)}`);
    } catch (error: any) {
      console.error('Error adjusting balance:', error);
      alert(`Error adjusting balance: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 bg-[var(--gradient-hero)] text-foreground">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <span className="font-heading font-bold text-xl text-foreground">
                  {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-white">
              <Shield className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-xl text-foreground drop-shadow-sm">{profile?.full_name || 'User'}</h1>
            <p className="text-foreground/90 text-sm drop-shadow-sm">{profile?.email}</p>
            <p className="text-foreground/80 text-xs drop-shadow-sm">
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Dec 2023'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-foreground hover:bg-foreground/20"
            onClick={() => setEditModalOpen(true)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>

      </div>

      <div className="p-4 space-y-4 -mt-4 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="card-elevated p-3 text-center">
            <p className="text-lg font-bold text-success">GHC {parseFloat(profile?.account_balance?.toString() || '0').toFixed(2)}</p>
            <p className="text-muted-foreground text-xs">Balance</p>
          </Card>
          <Card className="card-elevated p-3 text-center">
            <p className="text-lg font-bold text-accent">GHC 19,500</p>
            <p className="text-muted-foreground text-xs">Total Borrowed</p>
          </Card>
          <Card className="card-elevated p-3 text-center">
            <p className="text-lg font-bold text-primary">2</p>
            <p className="text-muted-foreground text-xs">Active Loans</p>
          </Card>
        </div>

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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEditModalOpen(true)}
            >
              Add New
            </Button>
          </div>
          <div className="space-y-3">
            {(profile?.payment_methods && profile.payment_methods.length > 0) ? (
              profile.payment_methods.map((method: any, index: number) => (
                <div key={method.id || index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{method.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{method.type}</p>
                      <p className="text-muted-foreground text-xs">
                        {"last4" in method && method.last4 ? `****${method.last4}` : method.email}
                      </p>
                    </div>
                  </div>
                  {method.primary && (
                    <Badge variant="outline" className="text-xs">
                      Primary
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                No payment methods added yet. Click "Add New" to get started.
              </p>
            )}
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

      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        profile={profile}
        onUpdate={fetchProfile}
      />
    </div>
  );
}