import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import Loans from "./pages/Loans";
import Profile from "./pages/Profile";
import CreateListing from "./pages/CreateListing";
import UserProfile from "./pages/UserProfile";
import RequestLoan from "./pages/RequestLoan";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/marketplace" element={<MainLayout><Marketplace /></MainLayout>} />
          <Route path="/loans" element={<MainLayout><Loans /></MainLayout>} />
          <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/user-profile/:userId" element={<UserProfile />} />
          <Route path="/request-loan" element={<RequestLoan />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
