
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

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

// Components
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardRoute = () => {
    if (!user) return "/";
    switch (user.role) {
      case 'entrepreneur':
        return "/entrepreneur/dashboard";
      case 'investor':
        return "/investor/dashboard";
      case 'admin':
        return "/admin/dashboard";
      default:
        return "/";
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
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

            {/* Investor Routes */}
            <Route path="/investor/dashboard" element={
              <ProtectedRoute allowedRoles={['investor']}>
                <InvestorDashboard />
              </ProtectedRoute>
            } />
            
            {/* Shared Routes (Investor & Admin) */}
            <Route path="/opportunities/:id" element={
              <ProtectedRoute allowedRoles={['investor', 'admin']}>
                <OpportunityDetail />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/opportunities/:id/review" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <OpportunityReview />
              </ProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
