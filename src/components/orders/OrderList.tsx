
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import OrderCard from "./OrderCard";
import OrderTableRow from "./OrderTableRow";
import { Plus, List, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { statusFilterOptions, timeFilterOptions } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const OrderList = () => {
  const { 
    filteredOrders, 
    activeStatusFilter,
    activeTimeFilter,
    setActiveStatusFilter, 
    setActiveTimeFilter,
    viewMode,
    setViewMode
  } = useApp();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-semibold">Orders</h2>
        <Link to="/orders/new">
          <Button className="bg-cake-primary hover:bg-cake-primary/80 text-cake-text">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-2">
        <div className="flex overflow-x-auto pb-2 space-x-2">
          {statusFilterOptions.map((filter) => (
            <Button
              key={filter.id}
              variant="outline"
              size="sm"
              className={cn(
                "whitespace-nowrap",
                activeStatusFilter.value === filter.value ? "filter-active" : ""
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
                activeTimeFilter.value === filter.value ? "filter-active" : ""
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
            <p className="text-muted-foreground">No orders found</p>
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

export default OrderList;
