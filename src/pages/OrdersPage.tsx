
import OrderList from "@/components/orders/OrderList";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { toast } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X, QrCode, LayoutGrid, List, Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DateRangePicker from "@/components/orders/DateRangePicker";
import StatusFilterDropdown from "@/components/orders/StatusFilterDropdown";
import { statusFilterOptions } from "@/data/mockData";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const OrdersPage = () => {
  const { 
    setSearchQuery,
    orders,
    getOrderById,
    searchQuery,
    viewMode,
    setViewMode,
    activeStatusFilters,
    setActiveStatusFilters,
    dateRange,
    setDateRange,
    resetFilters,
    filteredOrders
  } = useApp();
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idFromQR = searchParams.get("id");
  const [showQrAlert, setShowQrAlert] = useState(false);
  const [orderFound, setOrderFound] = useState<boolean | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // If there's an ID in the URL (e.g., from scanning a QR code), set it as search query
  useEffect(() => {
    if (idFromQR) {
      setSearchQuery(idFromQR);
      
      // Check if order exists
      const orderExists = getOrderById(idFromQR);
      setOrderFound(!!orderExists);
      setShowQrAlert(true);
      
      if (!orderExists) {
        toast.error(`Order with ID ${idFromQR} not found`);
      } else {
        toast.success(`Order #${idFromQR} found`);
      }
    }
  }, [idFromQR, setSearchQuery, getOrderById]);

  const handleClearQrSearch = () => {
    setShowQrAlert(false);
    setSearchQuery("");
    navigate("/orders");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    // Clear the URL param if it exists
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.has('id')) {
      navigate('/orders');
    }
  };

  // Calculate the total number of active filters
  const activeFilterCount = (
    (dateRange[0] && dateRange[1] ? 1 : 0) + 
    (searchQuery ? 1 : 0) +
    (activeStatusFilters.length === 1 && activeStatusFilters[0].value === 'all' ? 0 : activeStatusFilters.length)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>
      
      {showQrAlert && (
        <Alert 
          className={`border ${orderFound ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}`}
        >
          <div className="flex justify-between items-center">
            <AlertDescription className="flex items-center">
              {orderFound ? (
                <>
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>Order <strong>{idFromQR}</strong> found from QR scan</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-red-600 mr-2" />
                  <span>Order <strong>{idFromQR}</strong> not found from QR scan</span>
                </>
              )}
            </AlertDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearQrSearch}
              className="ml-2"
            >
              Clear search
            </Button>
          </div>
        </Alert>
      )}
      
      <p className="text-muted-foreground mb-4">
        Order IDs now show month and year (MM-YY-XXX format) to easily track when orders were placed.
        QR codes on printed orders can be scanned with any phone's camera app to quickly find them here.
        Click the <QrCode className="inline h-3 w-3 mx-1" /> icon to scan QR codes directly in the app.
      </p>

      {/* Search and filter controls */}
      <div className="space-y-4">
        {/* Search input with QR button */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search order by ID or customer name..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus={!!searchQuery} // Auto focus if there's a search query
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="flex-shrink-0"
            onClick={() => setIsQrScannerOpen(true)}
            title="Scan QR Code"
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Filter Section */}
          <div className="rounded-md border p-3 bg-gray-50">
            <h3 className="font-medium mb-2 text-sm text-muted-foreground">Filter by Date</h3>
            <DateRangePicker 
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>

          {/* Status Filter Section */}
          <div className="rounded-md border p-3 bg-gray-50">
            <h3 className="font-medium mb-2 text-sm text-muted-foreground">Filter by Status</h3>
            <StatusFilterDropdown 
              options={statusFilterOptions}
              selectedOptions={activeStatusFilters}
              onChange={setActiveStatusFilters}
            />
          </div>

          {/* View Options & Reset Filters */}
          <div className="rounded-md border p-3 bg-gray-50 flex flex-col">
            <h3 className="font-medium mb-2 text-sm text-muted-foreground">View Options</h3>
            <div className="flex items-center gap-2">
              <div className="flex border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-r-none border-r",
                    viewMode === "list" ? "bg-muted" : ""
                  )}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4 mr-1" /> List
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-l-none",
                    viewMode === "grid" ? "bg-muted" : ""
                  )}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4 mr-1" /> Grid
                </Button>
              </div>
            </div>
            
            {/* Reset Filters Button */}
            {activeFilterCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                className="mt-auto flex gap-2"
              >
                <FilterX className="h-4 w-4" /> 
                Clear all filters
                <span className="ml-auto bg-muted rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Results indicator */}
      <div className="flex justify-between items-center border-b pb-2">
        <div className="text-sm text-muted-foreground">
          Showing {filteredOrders.length} of {orders.length} orders
          {activeFilterCount > 0 && (
            <span className="ml-1">
              with {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div>
          <Button className="bg-cake-primary hover:bg-cake-primary/80 text-cake-text">
            <span>+ New Order</span>
          </Button>
        </div>
      </div>

      <OrderList />
    </div>
  );
};

export default OrdersPage;
