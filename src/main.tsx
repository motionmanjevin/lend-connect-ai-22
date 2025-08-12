import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from '@/hooks/useAuth';
import Index from './pages/Index.tsx'
import Auth from './pages/Auth.tsx'
import Home from './pages/Home.tsx'
import Marketplace from './pages/Marketplace.tsx'
import RequestLoan from './pages/RequestLoan.tsx'
import CreateListing from './pages/CreateListing.tsx'
import Loans from './pages/Loans.tsx'
import Profile from './pages/Profile.tsx'
import UserProfile from './pages/UserProfile.tsx'
import NotFound from './pages/NotFound.tsx'
import { MainLayout } from './components/Layout/MainLayout.tsx'
import './index.css'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route element={<MainLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/request-loan" element={<RequestLoan />} />
                <Route path="/create-listing" element={<CreateListing />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user/:id" element={<UserProfile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
