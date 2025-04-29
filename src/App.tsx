
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
import NotFound from "./pages/NotFound";
import { AppProvider } from "./context/AppContext";

const queryClient = new QueryClient();

const App = () => (
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
