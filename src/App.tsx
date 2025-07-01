
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/useDataStore";
import { useEffect, useMemo } from "react";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Layout
import { ModernLayout } from '@/components/Layout/ModernLayout';

// Pages
import { ModernLanding } from "./pages/ModernLanding";
import { ModernLogin } from "./pages/auth/ModernLogin";
import { ModernSignUp } from "./pages/auth/ModernSignUp";
import EntrepreneurDashboard from "./pages/entrepreneur/EntrepreneurDashboard";
import CreateOpportunity from "./pages/entrepreneur/CreateOpportunity";
import InvestorDashboard from "./pages/investor/InvestorDashboard";
import Portfolio from "./pages/investor/Portfolio";
import Payments from "./pages/investor/Payments";
import OpportunityDetail from "./pages/opportunities/OpportunityDetail";
import OpportunitiesList from "./pages/opportunities/OpportunitiesList";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OpportunityReview from "./pages/admin/OpportunityReview";
import OpportunityReviewList from "./pages/admin/OpportunityReviewList";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/admin/UserManagement";
import InvestmentPools from "./pages/admin/InvestmentPools";
import EscrowManagement from "./pages/admin/EscrowManagement";
import ServiceProviderDashboard from './pages/service-provider/ServiceProviderDashboard';
import PoolDashboard from '@/pages/pool/PoolDashboard';

// Components
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, user, loading, initialize } = useAuthStore();
  const { syncAllData } = useDataStore();

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated && user) {
      syncAllData();
    }
  }, [isAuthenticated, user, syncAllData]);

  const getDashboardRoute = useMemo(() => {
    if (!user) return "/";
    const userRole = user.role || user.user_metadata?.role || 'entrepreneur';
    switch (userRole) {
      case 'entrepreneur':
        return "/entrepreneur/dashboard";
      case 'investor':
        return "/investor/dashboard";
      case 'service_provider':
        return "/service-provider/dashboard";
      case 'admin':
      case 'super_admin':
        return "/admin/dashboard";
      default:
        return "/entrepreneur/dashboard";
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">AC</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ModernLayout>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={!isAuthenticated ? <ModernLanding /> : <Navigate to={getDashboardRoute} />} />
                    <Route path="/login" element={!isAuthenticated ? <ModernLogin /> : <Navigate to={getDashboardRoute} />} />
                    <Route path="/signup" element={!isAuthenticated ? <ModernSignUp /> : <Navigate to={getDashboardRoute} />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Navigate to={getDashboardRoute} />
                      </ProtectedRoute>
                    } />

                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />

                    {/* Entrepreneur Routes */}
                    <Route path="/entrepreneur/dashboard" element={
                      <ProtectedRoute allowedRoles={['entrepreneur']}>
                        <EntrepreneurDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/entrepreneur/opportunities/new" element={
                      <ProtectedRoute allowedRoles={['entrepreneur']}>
                        <CreateOpportunity />
                      </ProtectedRoute>
                    } />
                    <Route path="/entrepreneur/edit-opportunity/:id" element={
                      <ProtectedRoute allowedRoles={['entrepreneur']}>
                        <CreateOpportunity />
                      </ProtectedRoute>
                    } />

                    {/* Investor Routes */}
                    <Route path="/investor/dashboard" element={
                      <ProtectedRoute allowedRoles={['investor']}>
                        <InvestorDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/investor/portfolio" element={
                      <ProtectedRoute allowedRoles={['investor']}>
                        <Portfolio />
                      </ProtectedRoute>
                    } />
                    <Route path="/investor/payments" element={
                      <ProtectedRoute allowedRoles={['investor']}>
                        <Payments />
                      </ProtectedRoute>
                    } />
                    
                    {/* Shared Routes (Investor & Admin) */}
                    <Route path="/opportunities/:id" element={
                      <ProtectedRoute allowedRoles={['investor', 'admin', 'super_admin']}>
                        <OpportunityDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="/opportunities/list" element={
                      <ProtectedRoute allowedRoles={['investor', 'admin', 'super_admin']}>
                        <OpportunitiesList />
                      </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={
                      <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                      <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                        <UserManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/investment-pools" element={
                      <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                        <InvestmentPools />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/escrow" element={
                      <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                        <EscrowManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/opportunities/:id/review" element={
                      <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                        <OpportunityReview />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/opportunities/review-list" element={
                      <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                        <OpportunityReviewList />
                      </ProtectedRoute>
                    } />

                    {/* Service Provider Routes */}
                    <Route path="/service-provider/dashboard" element={
                      <ProtectedRoute allowedRoles={['service_provider']}>
                        <ServiceProviderDashboard />
                      </ProtectedRoute>
                    } />

                    {/* Pool Routes */}
                    <Route path="/pool/:poolId" element={
                      <ProtectedRoute allowedRoles={['investor', 'admin', 'super_admin']}>
                        <PoolDashboard />
                      </ProtectedRoute>
                    } />

                    {/* Catch all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ModernLayout>
              </BrowserRouter>
            </TooltipProvider>
          </CurrencyProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
