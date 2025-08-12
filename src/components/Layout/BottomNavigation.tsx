import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, CreditCard, Users, User, Plus } from "lucide-react";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "marketplace", label: "Market", icon: Search, path: "/marketplace" },
  { id: "loans", label: "Loans", icon: Plus, path: "/create-listing", isAddButton: true },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
];

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabPress = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 z-50">
      <div className="flex items-center justify-around py-3 px-6 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          const isAddButton = tab.isAddButton;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab.path)}
              className={`relative flex flex-col items-center py-2 px-4 rounded-2xl transition-all duration-300 min-w-[70px] ${
                isAddButton
                  ? "bg-gradient-primary text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  : isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${
                isAddButton ? "text-white" : isActive ? "text-primary" : ""
              }`} />
              <span className={`text-xs font-medium ${
                isAddButton ? "text-white" : ""
              }`}>{tab.label}</span>
              {isActive && !isAddButton && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};