import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/useDataStore";
import { useEffect } from "react";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import EntrepreneurDashboard from "./pages/entrepreneur/EntrepreneurDashboard";
import CreateOpportunity from "./pages/entrepreneur/CreateOpportunity";
import InvestorDashboard from "./pages/investor/InvestorDashboard";
import OpportunityDetail from "./pages/opportunities/OpportunityDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OpportunityReview from "./pages/admin/OpportunityReview";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/admin/UserManagement";
import InvestmentPools from "./pages/admin/InvestmentPools";
import EscrowManagement from "./pages/admin/EscrowManagement";

// Components
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, user, loading, initialize } = useAuthStore();
  const { syncAllData } = useDataStore();

  useEffect(() => {
    // Initialize authentication
    const cleanup = initialize();
    
    return cleanup;
  }, [initialize]);

  useEffect(() => {
    // Sync data when user is authenticated
    if (isAuthenticated && user) {
      syncAllData();
    }
  }, [isAuthenticated, user, syncAllData]);

  const getDashboardRoute = () => {
    if (!user) return "/";
    
    // Get role from user metadata or default to entrepreneur
    const userRole = user.user_metadata?.role || 'entrepreneur';
    
    switch (userRole) {
      case 'entrepreneur':
        return "/entrepreneur/dashboard";
      case 'investor':
        return "/investor/dashboard";
      case 'admin':
      case 'super_admin':
        return "/admin/dashboard";
      default:
        return "/entrepreneur/dashboard";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to={getDashboardRoute()} />} />
              <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getDashboardRoute()} />} />
              <Route path="/signup" element={!isAuthenticated ? <SignUp /> : <Navigate to={getDashboardRoute()} />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Navigate to={getDashboardRoute()} />
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
              
              {/* Shared Routes (Investor & Admin) */}
              <Route path="/opportunities/:id" element={
                <ProtectedRoute allowedRoles={['investor', 'admin', 'super_admin']}>
                  <OpportunityDetail />
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

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
};

export default App;
