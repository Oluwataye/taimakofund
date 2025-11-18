import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Layouts
import { PublicLayout } from "./components/layouts/PublicLayout";
import { UserLayout } from "./components/layouts/UserLayout";
import { ModeratorLayout } from "./components/layouts/ModeratorLayout";
import { AdminLayout } from "./pages/admin/AdminLayout";

// Public Pages
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import CampaignDetail from "./pages/CampaignDetail";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// User Pages
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import CreateCampaign from "./pages/CreateCampaign";

// Moderator Pages
import ModeratorDashboard from "./pages/moderator/Dashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCampaigns from "./pages/admin/Campaigns";
import AdminWithdrawals from "./pages/admin/Withdrawals";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/public" replace />} />
            
            {/* Auth route (standalone) */}
            <Route path="/auth" element={<Auth />} />

            {/* Public routes */}
            <Route path="/public" element={<PublicLayout />}>
              <Route index element={<Index />} />
              <Route path="discover" element={<Discover />} />
              <Route path="campaign/:id" element={<CampaignDetail />} />
            </Route>

            {/* User routes (protected) */}
            <Route 
              path="/user" 
              element={
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/user/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="create-campaign" element={<CreateCampaign />} />
            </Route>

            {/* Moderator routes (protected) */}
            <Route path="/moderator" element={<ModeratorLayout />}>
              <Route index element={<ModeratorDashboard />} />
              <Route path="reports" element={<div>Reports Page - Coming Soon</div>} />
              <Route path="comments" element={<div>Comments Moderation - Coming Soon</div>} />
              <Route path="campaigns" element={<div>Campaign Reviews - Coming Soon</div>} />
            </Route>

            {/* Admin routes (protected) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="campaigns" element={<AdminCampaigns />} />
              <Route path="withdrawals" element={<AdminWithdrawals />} />
            </Route>

            {/* Legacy redirects for backwards compatibility */}
            <Route path="/discover" element={<Navigate to="/public/discover" replace />} />
            <Route path="/campaign/:id" element={<Navigate to="/public/campaign/:id" replace />} />
            <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
            <Route path="/analytics" element={<Navigate to="/user/analytics" replace />} />
            <Route path="/create-campaign" element={<Navigate to="/user/create-campaign" replace />} />

            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
