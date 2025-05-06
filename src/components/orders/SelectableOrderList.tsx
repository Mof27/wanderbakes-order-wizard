
import React from "react";
import { Order } from "@/types";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SelectableOrderTableRow from "./SelectableOrderTableRow";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";
import { DeliveryTrip } from "@/types/trip";

interface SelectableOrderListProps {
  orders: Order[];
  onOrderClick?: (orderId: string) => void;
  renderActions?: (order: Order) => React.ReactNode;
  useWorkflowStatus?: boolean;
  tripsMap?: Map<string, DeliveryTrip>;
}

const SelectableOrderList: React.FC<SelectableOrderListProps> = ({ 
  orders, 
  onOrderClick, 
  renderActions,
  useWorkflowStatus = true,
  tripsMap
}) => {
  const { orderSelection, toggleOrderSelection } = useApp();
  const { selectedOrderIds, isSelectionMode } = orderSelection;

  if (orders.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No orders found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {isSelectionMode && <TableHead className="w-[50px]"></TableHead>}
            <TableHead className="w-[100px]">Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Delivery Date</TableHead>
            <TableHead>Cake</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Trip</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const trip = tripsMap?.get(order.id);
            
            return (
              <SelectableOrderTableRow 
                key={order.id} 
                order={order} 
                onClick={() => onOrderClick && onOrderClick(order.id)}
                customActions={renderActions ? renderActions(order) : undefined}
                useWorkflowStatus={useWorkflowStatus}
                isSelectable={isSelectionMode}
                isSelected={selectedOrderIds.includes(order.id)}
                onSelectionChange={() => toggleOrderSelection(order.id)}
                trip={trip}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SelectableOrderList;
