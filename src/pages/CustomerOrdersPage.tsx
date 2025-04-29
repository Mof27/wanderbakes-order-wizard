
import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Customer, FilterOption, Order } from "@/types";
import { statusFilterOptions, timeFilterOptions } from "@/data/mockData";
import OrderTableRow from "@/components/orders/OrderTableRow";
import OrderCard from "@/components/orders/OrderCard";
import { ArrowLeft, List, LayoutGrid, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const CustomerOrdersPage = () => {
  const { id } = useParams<{ id: string }>();
  const { orders, customers } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeStatusFilter, setActiveStatusFilter] = useState<FilterOption>(statusFilterOptions[0]);
  const [activeTimeFilter, setActiveTimeFilter] = useState<FilterOption>(timeFilterOptions[0]);
  const [customer, setCustomer] = useState<Customer | undefined>(undefined);

  // Find the customer
  useEffect(() => {
    const foundCustomer = customers.find((c) => c.id === id);
    setCustomer(foundCustomer);
  }, [id, customers]);

  // Filter customer orders
  const customerOrders = useMemo(() => {
    if (!customer) return [];
    return orders.filter(order => order.customer.id === customer.id);
  }, [customer, orders]);

  // Apply filters
  const filteredOrders = useMemo(() => {
    let filtered = [...customerOrders];
    
    // Status filtering
    if (activeStatusFilter.value !== 'all') {
      filtered = filtered.filter(order => order.status === activeStatusFilter.value);
    }

    // Time filtering
    if (activeTimeFilter.value !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);

        if (activeTimeFilter.value === 'today') {
          return orderDate.getTime() === today.getTime();
        }

        if (activeTimeFilter.value === 'this-week') {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          return orderDate >= startOfWeek;
        }

        if (activeTimeFilter.value === 'this-month') {
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          return orderDate >= startOfMonth;
        }

        return true;
      });
    }

    return filtered;
  }, [customerOrders, activeStatusFilter, activeTimeFilter]);

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/customers")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <h1 className="text-2xl font-bold">Customer Orders</h1>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/customers")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
        <h1 className="text-2xl font-bold">{customer.name}'s Orders</h1>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Contact</p>
            <p className="font-medium">{customer.whatsappNumber}</p>
            {customer.email && <p className="text-sm">{customer.email}</p>}
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground mb-1">Addresses ({customer.addresses.length})</p>
            {customer.addresses.length > 0 ? (
              <div className="max-h-32 overflow-y-auto space-y-2">
                {customer.addresses.map((address) => (
                  <div key={address.id} className="text-sm flex gap-2">
                    <Badge variant="outline" className="h-6">{address.area}</Badge>
                    <span>{address.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No addresses provided</p>
            )}
          </div>
          <div>
            <Link to={`/customers`} onClick={(e) => {
              e.preventDefault();
              navigate("/customers");
              // Using setTimeout to allow navigation to complete before trying to open dialog
              setTimeout(() => {
                const event = new CustomEvent("open-customer-detail", { 
                  detail: { customerId: customer.id } 
                });
                window.dispatchEvent(event);
              }, 100);
            }}>
              <Button variant="link" className="p-0 h-auto">View Customer Detail</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-2">
        <div className="flex overflow-x-auto pb-2 space-x-2">
          {statusFilterOptions.map((filter) => (
            <Button
              key={filter.id}
              variant="outline"
              size="sm"
              className={cn(
                "whitespace-nowrap",
                activeStatusFilter.value === filter.value ? "bg-muted" : ""
              )}
              onClick={() => setActiveStatusFilter(filter)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
        
        <div className="flex overflow-x-auto pb-2 space-x-2">
          {timeFilterOptions.map((filter) => (
            <Button
              key={filter.id}
              variant="outline"
              size="sm"
              className={cn(
                "whitespace-nowrap",
                activeTimeFilter.value === filter.value ? "bg-muted" : ""
              )}
              onClick={() => setActiveTimeFilter(filter)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="ml-auto flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            className={cn(viewMode === "list" ? "bg-muted" : "")}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(viewMode === "grid" ? "bg-muted" : "")}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No orders found for this customer</p>
          </div>
        ) : (
          <>
            {viewMode === "list" ? (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr className="text-left">
                      <th className="p-2 font-medium">Order ID</th>
                      <th className="p-2 font-medium">Customer</th>
                      <th className="p-2 font-medium">Status</th>
                      <th className="p-2 font-medium">Delivery Date</th>
                      <th className="p-2 font-medium">Cake</th>
                      <th className="p-2 font-medium">Price</th>
                      <th className="p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <OrderTableRow key={order.id} order={order} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerOrdersPage;
