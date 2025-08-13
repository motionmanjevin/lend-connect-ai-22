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
    } else if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <img src={logo} alt="LendMe" className="w-24 h-24 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={logo} alt="LendMe" className="w-16 h-16 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Welcome to LendMe</CardTitle>
          <CardDescription>
            Connect, lend, and borrow with confidence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full btn-hero" 
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate("/home")}
          >
            Continue as Guest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
