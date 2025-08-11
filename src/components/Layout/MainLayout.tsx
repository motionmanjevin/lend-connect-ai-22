import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { AIAssistant } from "../Features/AIAssistant";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
};