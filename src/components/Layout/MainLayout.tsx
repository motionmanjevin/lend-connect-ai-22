import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { AIAssistant } from "../Features/AIAssistant";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
};