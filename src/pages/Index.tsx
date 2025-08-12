import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/lend-me-logo.png";

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/home");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <img 
            src={logo} 
            alt="Lend Me Logo" 
            className="w-20 h-20 mx-auto mb-4 rounded-xl shadow-lg"
          />
          <h1 className="text-4xl font-bold text-foreground mb-2">Lend Me</h1>
          <p className="text-muted-foreground">Your trusted lending companion in Ghana</p>
        </div>

        <Card className="shadow-xl border-border/50 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Welcome to Lend Me</CardTitle>
            <CardDescription>
              Peer-to-peer lending made simple and secure with GHS payments
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-primary">💰 Earn Returns</h3>
                <p className="text-sm text-muted-foreground">Lend money and earn competitive interest rates</p>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-secondary">🤝 Get Loans</h3>
                <p className="text-sm text-muted-foreground">Borrow money from trusted community members</p>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-accent">🔒 Secure Payments</h3>
                <p className="text-sm text-muted-foreground">Powered by Paystack for safe GHS transactions</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => navigate("/auth")} 
                className="w-full"
                size="lg"
              >
                Get Started
              </Button>
              
              <p className="text-center text-xs text-muted-foreground">
                Join thousands of Ghanaians already using Lend Me
              </p>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
