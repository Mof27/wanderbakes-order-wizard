
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Index";
import OrdersPage from "./pages/OrdersPage";
import NewOrderPage from "./pages/NewOrderPage";
import EditOrderPage from "./pages/EditOrderPage";
import CustomersPage from "./pages/CustomersPage";
import CustomerOrdersPage from "./pages/CustomerOrdersPage";
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
