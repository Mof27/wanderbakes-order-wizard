
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import MainLayout from "./components/layout/MainLayout";
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
import NotFound from "./pages/NotFound";
import { AppProvider } from "./context/AppContext";
import { useEffect } from "react";
import { config } from "./config";
import { dataService } from "./services";

const queryClient = new QueryClient();

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
      <AppProvider>
        <HelmetProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                } />
                <Route path="/orders" element={
                  <MainLayout>
                    <OrdersPage />
                  </MainLayout>
                } />
                <Route path="/orders/new" element={
                  <MainLayout>
                    <NewOrderPage />
                  </MainLayout>
                } />
                <Route path="/orders/:id" element={
                  <MainLayout>
                    <EditOrderPage />
                  </MainLayout>
                } />
                <Route path="/orders/scan" element={
                  <MainLayout>
                    <ScanQrPage />
                  </MainLayout>
                } />
                <Route path="/orders/archived" element={
                  <MainLayout>
                    <ArchivedOrdersPage />
                  </MainLayout>
                } />
                <Route path="/kitchen" element={
                  <MainLayout>
                    <KitchenLeaderPage />
                  </MainLayout>
                } />
                <Route path="/baker" element={
                  <MainLayout>
                    <BakerPage />
                  </MainLayout>
                } />
                <Route path="/delivery" element={
                  <MainLayout>
                    <DeliveryPage />
                  </MainLayout>
                } />
                <Route path="/workflow" element={
                  <MainLayout>
                    <WorkflowPage />
                  </MainLayout>
                } />
                <Route path="/customers" element={
                  <MainLayout>
                    <CustomersPage />
                  </MainLayout>
                } />
                <Route path="/customers/:id/orders" element={
                  <MainLayout>
                    <CustomerOrdersPage />
                  </MainLayout>
                } />
                <Route path="/settings/*" element={
                  <MainLayout>
                    <SettingsPage />
                  </MainLayout>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </HelmetProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
