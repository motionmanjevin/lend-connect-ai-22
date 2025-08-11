import { useState } from "react";
import { Heart, MessageCircle, Share2, Award, TrendingUp, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const impactStories = [
  {
    id: 1,
    user: "Sarah Martinez",
    avatar: "SM",
    type: "success",
    story: "Thanks to the amazing lenders on Lend Me, I was able to renovate my kitchen and increase my home value by 15%! 🏠✨",
    amount: 5000,
    purpose: "Home Renovation",
    likes: 24,
    comments: 8,
    timeAgo: "2 hours ago",
    images: 1
  },
  {
    id: 2,
    user: "Investment Group A",
    avatar: "IG",
    type: "milestone",
    story: "Proud to announce we've funded over $50,000 in loans this month, helping 12 borrowers achieve their dreams! 💪",
    amount: 50000,
    purpose: "Community Impact",
    likes: 67,
    comments: 15,
    timeAgo: "5 hours ago",
    images: 0
  },
  {
    id: 3,
    user: "Mike Johnson",
    avatar: "MJ",
    type: "education",
    story: "Just completed my data science certification! The loan made it possible and I already landed a better job. ROI for everyone! 📊🎓",
    amount: 3500,
    purpose: "Education",
    likes: 42,
    comments: 12,
    timeAgo: "1 day ago",
    images: 2
  }
];

const topLenders = [
  { name: "Investment Group A", amount: 125000, loans: 45, avatar: "IG", trustScore: 98 },
  { name: "Community Fund", amount: 89000, loans: 32, avatar: "CF", trustScore: 96 },
  { name: "Private Investor", amount: 67000, loans: 28, avatar: "PI", trustScore: 94 },
  { name: "Sarah Williams", amount: 45000, loans: 18, avatar: "SW", trustScore: 97 }
];

const topBorrowers = [
  { name: "Mike Johnson", repaymentRate: 100, loans: 5, avatar: "MJ", trustScore: 95 },
  { name: "Tech Startup Inc.", repaymentRate: 100, loans: 3, avatar: "TS", trustScore: 88 },
  { name: "Sarah Martinez", repaymentRate: 100, loans: 4, avatar: "SM", trustScore: 95 },
  { name: "Local Business", repaymentRate: 98, loans: 7, avatar: "LB", trustScore: 92 }
];

const achievements = [
  { title: "First Loan", description: "Completed your first loan transaction", icon: "🎯", unlocked: true },
  { title: "Trusted Lender", description: "Funded 10+ successful loans", icon: "⭐", unlocked: true },
  { title: "Perfect Record", description: "100% on-time repayment rate", icon: "💯", unlocked: true },
  { title: "Community Hero", description: "Helped 25+ borrowers achieve their goals", icon: "🦸", unlocked: false },
  { title: "High Roller", description: "Lent over $50,000 total", icon: "💎", unlocked: false },
  { title: "Quick Repayer", description: "Paid off loan early 3 times", icon: "⚡", unlocked: true }
];

export default function Social() {
  const [activeTab, setActiveTab] = useState("feed");

  const getStoryTypeColor = (type: string) => {
    switch (type) {
      case "success": return "text-success";
      case "milestone": return "text-primary";
      case "education": return "text-info";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border">
        <h1 className="font-heading font-bold text-xl">Community</h1>
        <p className="text-muted-foreground text-sm">Connect, inspire, and grow together</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">Impact Feed</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Impact Feed */}
        <TabsContent value="feed" className="space-y-4 mt-4">
          {impactStories.map((story) => (
            <Card key={story.id} className="card-elevated p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-[var(--gradient-primary)] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">{story.avatar}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{story.user}</h3>
                    <span className={`text-xs ${getStoryTypeColor(story.type)}`}>
                      {story.type}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">{story.timeAgo}</p>
                </div>
              </div>

              <p className="mb-3 text-sm leading-relaxed">{story.story}</p>

              {story.images > 0 && (
                <div className="mb-3">
                  <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">
                      📸 {story.images} photo{story.images > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{story.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{story.comments}</span>
                  </button>
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-secondary transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <Badge variant="outline" className="text-xs">
                  ${story.amount.toLocaleString()}
                </Badge>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="space-y-4 mt-4">
          {/* Top Lenders */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <h3 className="font-heading font-semibold">Top Lenders</h3>
            </div>
            <div className="space-y-2">
              {topLenders.map((lender, index) => (
                <Card key={lender.name} className="card-interactive p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-[var(--gradient-secondary)] rounded-full flex items-center justify-center">
                        <span className="text-secondary-foreground font-semibold text-sm">{lender.avatar}</span>
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{lender.name}</h4>
                      <p className="text-muted-foreground text-sm">
                        ${lender.amount.toLocaleString()} • {lender.loans} loans
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-secondary fill-current" />
                        <span className="font-semibold">{lender.trustScore}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Top Borrowers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-semibold">Most Trusted Borrowers</h3>
            </div>
            <div className="space-y-2">
              {topBorrowers.map((borrower, index) => (
                <Card key={borrower.name} className="card-interactive p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-[var(--gradient-primary)] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{borrower.avatar}</span>
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{borrower.name}</h4>
                      <p className="text-muted-foreground text-sm">
                        {borrower.repaymentRate}% repayment • {borrower.loans} loans
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-secondary fill-current" />
                        <span className="font-semibold">{borrower.trustScore}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <Card
                key={achievement.title}
                className={`p-4 text-center transition-all duration-300 ${
                  achievement.unlocked
                    ? "card-elevated bg-[var(--gradient-hero)] text-white"
                    : "card-elevated opacity-60"
                }`}
              >
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <h4 className="font-heading font-semibold text-sm mb-1">
                  {achievement.title}
                </h4>
                <p className={`text-xs ${
                  achievement.unlocked ? "text-white/80" : "text-muted-foreground"
                }`}>
                  {achievement.description}
                </p>
                {achievement.unlocked && (
                  <Badge className="mt-2 bg-white/20 text-white border-white/30">
                    <Award className="w-3 h-3 mr-1" />
                    Unlocked
                  </Badge>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}