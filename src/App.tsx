
import React, { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import MainLayout from "./components/layout/MainLayout";
import AuthMainLayout from "./components/layout/AuthMainLayout";
import Dashboard from "./pages/Index";
import OrdersPage from "./pages/OrdersPage";
import NewOrderPage from "./pages/NewOrderPage";
import EditOrderPage from "./pages/EditOrderPage";
import CustomersPage from "./pages/CustomersPage";
import CustomerOrdersPage from "./pages/CustomerOrdersPage";
import SettingsPage from "./pages/SettingsPage";
import ScanQrPage from "./pages/ScanQrPage";
import KitchenLeaderPage from "./pages/KitchenLeaderPage";
import BakerPage from "./pages/BakerPage";
import DeliveryPage from "./pages/DeliveryPage";
import WorkflowPage from "./pages/WorkflowPage";
import ArchivedOrdersPage from "./pages/ArchivedOrdersPage";
import GalleryPage from "./pages/GalleryPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminResetPage from "./pages/AdminResetPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFound from "./pages/NotFound";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { config } from "./config";
import { dataService } from "./services";
import RoleGuard from "./components/layout/RoleGuard";
import AuthWrapper from "./components/layout/AuthWrapper";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  // Initialize data service
  useEffect(() => {
    // Set the data source mode from config
    dataService.setMode(config.api.dataSourceMode, config.api.baseUrl);
    
    if (config.debug.enabled && config.debug.dataService) {
      console.log(`Data service initialized in ${config.api.dataSourceMode} mode`);
    }

    // Handle migration of existing customers with old address format
    const migrateCustomers = async () => {
      const customers = await dataService.customers.getAll();
      for (const customer of customers) {
        // @ts-ignore - to handle old format with address property
        if (customer.addresses?.length === 0 && customer.addresses) {
          // Convert old address format to new format if needed
          // This is just a placeholder as we've already updated the type definition
          await dataService.customers.update(customer.id, {
            ...customer,
            addresses: []
          });
        }
      }
    };
    
    migrateCustomers().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <HelmetProvider>
            <TooltipProvider>
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Authentication routes - no auth required */}
                  <Route path="/auth" element={
                    <AuthWrapper requireAuth={false}>
                      <AuthPage />
                    </AuthWrapper>
                  } />
                  
                  {/* Redirect old PIN login route to regular auth */}
                  <Route path="/pin-login" element={<Navigate to="/auth" replace />} />
                  
                  {/* Admin reset route - no auth required */}
                  <Route path="/admin-reset" element={
                    <AuthWrapper requireAuth={false}>
                      <AdminResetPage />
                    </AuthWrapper>
                  } />
                  
                  {/* Unauthorized access page */}
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  
                  {/* Protected routes - require authentication */}
                  <Route path="/" element={
                    <AuthWrapper>
                      <AuthMainLayout>
                        <Dashboard />
                      </AuthMainLayout>
                    </AuthWrapper>
                  } />
                  
                  {/* User profile page */}
                  <Route path="/profile" element={
                    <AuthWrapper>
                      <AuthMainLayout>
                        <ProfilePage />
                      </AuthMainLayout>
                    </AuthWrapper>
                  } />
                  
                  {/* Admin routes */}
                  <Route path="/admin/users" element={
                    <AuthWrapper>
                      <RoleGuard allowedRoles={['admin']}>
                        <AuthMainLayout>
                          <AdminUsersPage />
                        </AuthMainLayout>
                      </RoleGuard>
                    </AuthWrapper>
                  } />
                  
                  {/* Sales routes */}
                  <Route path="/orders" element={
                    <AuthWrapper>
                      <RoleGuard allowedRoles={['admin', 'sales']}>
                        <AuthMainLayout>
                          <OrdersPage />
                        </AuthMainLayout>
                      </RoleGuard>
                    </AuthWrapper>
                  } />
                  
                  <Route path="/orders/new" element={
                    <AuthWrapper>
                      <RoleGuard allowedRoles={['admin', 'sales']}>
                        <AuthMainLayout>
                          <NewOrderPage />
                        </AuthMainLayout>
                      </RoleGuard>
                    </AuthWrapper>
                  } />
                  
                  <Route path="/orders/:id" element={
                    <AuthWrapper>
                      <RoleGuard allowedRoles={['admin', 'sales', 'kitchen']}>
                        <AuthMainLayout>
                          <EditOrderPage />
                        </AuthMainLayout>
                      </RoleGuard>
                    </AuthWrapper>
                  } />
                  
                  <Route path="/orders/scan" element={
                    <AuthWrapper>
                      <RoleGuard allowedRoles={['admin', 'sales', 'kitchen', 'delivery', 'customer_service']}>
                        <AuthMainLayout>
                          <ScanQrPage />
                        </AuthMainLayout>
                      </RoleGuard>
                    </AuthWrapper>
                  } />
                  
                  <Route path="/orders/archived" element={
                    <AuthWrapper>
                      <RoleGuard allowedRoles={['admin', 'sales']}>
                        <AuthMainLayout>
                          <ArchivedOrdersPage />
                        </AuthMainLayout>
                      </RoleGuard>
                    </AuthWrapper>
                  } />
                  
                  {/* Kitchen routes */}
                  <Route path="/kitchen" element={
                    <AuthWrapper>
                      <RoleGuard allowedRoles={['admin', 'kitchen']}>
                        <AuthMainLayout>
                          <KitchenLeaderPage />
                        </AuthMainLayout>
                      </RoleGuard>
                    </AuthWrapper>
                  } />
                  
                  {/* Baker routes */}
                  <Route path="/baker" element={
                    <AuthWrapper>
                      <RoleGuard allowedRoles={['admin', 'baker']}>
                        <AuthMainLayout>
                          <BakerPage />
                        </AuthMainLayout>
                      </RoleGuard>
                    </AuthWrapper>
                  } />
                  
                  {/* Delivery routes */}
                  <Route path="/delivery" element={
                    <AuthWrapper>
                      <RoleGuard allowedRoles={['admin', 'delivery', 'customer_service']}>
                        <AuthMainLayout>
                          <DeliveryPage />
                        </AuthMainLayout>
                      </RoleGuard>
                    </AuthWrapper>
                  } />
                  
                  {/* Workflow routes - for admins and kitchen staff */}
                  <Route path="/workflow" element={
                    <AuthWrapper>
                      <RoleGuard allowedRoles={['admin', 'kitchen']}>
                        <AuthMainLayout>
                          <WorkflowPage />
                        </AuthMainLayout>
                      </RoleGuard>
                    </AuthWrapper>
                  } />
                  
                  {/* Gallery - visible to more roles for reference */}
                  <Route path="/gallery" element={
                    <AuthWrapper>
                      <RoleGuard allowedRoles={['admin', 'sales', 'kitchen', 'baker', 'customer_service']}>
                        <AuthMainLayout>
                          <GalleryPage />
                        </AuthMainLayout>
                      </RoleGuard>
                    </AuthWrapper>
                  } />
                  
                  {/* Customer management */}
                  <Route path="/customers" element={
                    <AuthWrapper>
                      <RoleGuard allowedRoles={['admin', 'sales', 'customer_service']}>
                        <AuthMainLayout>
                          <CustomersPage />
                        </AuthMainLayout>
                      </RoleGuard>
                    </AuthWrapper>
                  } />
                  
                  <Route path="/customers/:id/orders" element={
                    <AuthWrapper>
                      <RoleGuard allowedRoles={['admin', 'sales', 'customer_service']}>
                        <AuthMainLayout>
                          <CustomerOrdersPage />
                        </AuthMainLayout>
                      </RoleGuard>
                    </AuthWrapper>
                  } />
                  
                  {/* Settings - admin only */}
                  <Route path="/settings/*" element={
                    <AuthWrapper>
                      <RoleGuard allowedRoles={['admin']}>
                        <AuthMainLayout>
                          <SettingsPage />
                        </AuthMainLayout>
                      </RoleGuard>
                    </AuthWrapper>
                  } />
                  
                  {/* Catch-all for 404s */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </HelmetProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
