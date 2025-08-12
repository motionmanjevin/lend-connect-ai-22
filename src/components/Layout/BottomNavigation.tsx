import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, CreditCard, Users, User, Plus } from "lucide-react";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "marketplace", label: "Market", icon: Search, path: "/marketplace" },
  { id: "create", label: "Create", icon: Plus, path: "/create-listing" },
  { id: "loans", label: "Loans", icon: CreditCard, path: "/loans" },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
];

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabPress = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="relative">
        {/* Bottom Navigation */}
        <div className="flex items-center justify-around py-2 px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab.path)}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 min-w-[64px] ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-primary" : ""}`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};