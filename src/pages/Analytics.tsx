import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  Brain,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Cell, BarChart, Bar } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Mock data for demonstrations
const portfolioData = [
  { month: "Jan", lending: 12000, borrowing: 3000, profit: 850 },
  { month: "Feb", lending: 15000, borrowing: 4500, profit: 1200 },
  { month: "Mar", lending: 18000, borrowing: 5200, profit: 1650 },
  { month: "Apr", lending: 22000, borrowing: 4800, profit: 2100 },
  { month: "May", lending: 25000, borrowing: 6000, profit: 2450 },
  { month: "Jun", lending: 28000, borrowing: 5500, profit: 2800 },
];

const riskDistribution = [
  { name: "Low Risk", value: 60, color: "hsl(var(--success))" },
  { name: "Medium Risk", value: 30, color: "hsl(var(--warning))" },
  { name: "High Risk", value: 10, color: "hsl(var(--destructive))" },
];

const loanPerformance = [
  { category: "Personal Loans", completed: 85, defaulted: 5, pending: 10 },
  { category: "Business Loans", completed: 78, defaulted: 8, pending: 14 },
  { category: "Emergency Loans", completed: 92, defaulted: 3, pending: 5 },
];

export default function Analytics() {
  const [profile, setProfile] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      generateAIInsights();
    }
  }, [user]);

  // Reset scroll position on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const generateAIInsights = () => {
    // Simulated AI insights based on user data
    const insights = [
      "Your lending portfolio has grown 133% over the last 6 months, showing excellent diversification.",
      "Low-risk loans make up 60% of your portfolio - consider allocating 10% more to medium-risk for higher returns.",
      "Your loan completion rate of 85% is above market average. Consider increasing your lending capacity.",
      "Peak lending activity occurs on Tuesdays and Wednesdays. Optimize your funding during these periods.",
      "Your current debt-to-income ratio suggests room for 15% more borrowing if needed for expansion."
    ];
    setAiInsights(insights);
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <div className="bg-card border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl">Smart Analytics</h1>
            <p className="text-muted-foreground">AI-powered insights for your lending portfolio</p>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">AI Powered</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-full">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Lent</p>
                  <p className="text-xl font-bold">GHC 28,000</p>
                  <div className="flex items-center gap-1 text-success text-sm">
                    <ArrowUp className="w-3 h-3" />
                    <span>+12%</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Loans</p>
                  <p className="text-xl font-bold">23</p>
                  <div className="flex items-center gap-1 text-success text-sm">
                    <ArrowUp className="w-3 h-3" />
                    <span>+3</span>
                  </div>
                </div>
                <Target className="w-8 h-8 text-secondary/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profit This Month</p>
                  <p className="text-xl font-bold">GHC 2,800</p>
                  <div className="flex items-center gap-1 text-success text-sm">
                    <ArrowUp className="w-3 h-3" />
                    <span>+18%</span>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-accent/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-xl font-bold">85%</p>
                  <div className="flex items-center gap-1 text-warning text-sm">
                    <ArrowDown className="w-3 h-3" />
                    <span>-2%</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-info/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Insights & Recommendations
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your lending patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <Tabs defaultValue="portfolio" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="portfolio">Portfolio Trend</TabsTrigger>
            <TabsTrigger value="performance">Loan Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Portfolio Growth Over Time</CardTitle>
                <CardDescription>Your lending and borrowing activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    lending: {
                      label: "Lending",
                      color: "hsl(var(--primary))",
                    },
                    borrowing: {
                      label: "Borrowing",
                      color: "hsl(var(--secondary))",
                    },
                    profit: {
                      label: "Profit",
                      color: "hsl(var(--accent))",
                    },
                  }}
                  className="h-[250px] md:h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="lending"
                        stackId="1"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.8}
                      />
                      <Area
                        type="monotone"
                        dataKey="borrowing"
                        stackId="1"
                        stroke="hsl(var(--secondary))"
                        fill="hsl(var(--secondary))"
                        fillOpacity={0.8}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="performance">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Loan Performance by Category</CardTitle>
                <CardDescription>Success rates across different loan types</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    completed: {
                      label: "Completed",
                      color: "hsl(var(--success))",
                    },
                    pending: {
                      label: "Pending",
                      color: "hsl(var(--warning))",
                    },
                    defaulted: {
                      label: "Defaulted",
                      color: "hsl(var(--destructive))",
                    },
                  }}
                  className="h-[250px] md:h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={loanPerformance}>
                      <XAxis dataKey="category" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="completed" fill="hsl(var(--success))" />
                      <Bar dataKey="pending" fill="hsl(var(--warning))" />
                      <Bar dataKey="defaulted" fill="hsl(var(--destructive))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Items */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>Based on your current portfolio performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20">
              <div>
                <p className="font-medium text-success">Diversify into Medium Risk</p>
                <p className="text-sm text-muted-foreground">Potential for 2.3% higher returns</p>
              </div>
              <Button variant="outline" size="sm">
                View Options
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-info/5 rounded-lg border border-info/20">
              <div>
                <p className="font-medium text-info">Optimize Timing</p>
                <p className="text-sm text-muted-foreground">Tuesday-Wednesday peak activity detected</p>
              </div>
              <Button variant="outline" size="sm">
                Set Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}