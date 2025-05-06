
import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { User, CalendarClock, Car } from "lucide-react";
import { Order } from "@/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import DeliveryOrderRow from "./DeliveryOrderRow";

interface DeliveryOrdersTableProps {
  orders: Order[];
  selectedOrderIds: string[];
  onSelectOrder: (orderId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onOpenDriverDialog: (order: Order) => void;
  onOpenPhotoDialog: (order: Order) => void;
  onStatusChange: () => void;
}

const DeliveryOrdersTable: React.FC<DeliveryOrdersTableProps> = ({
  orders,
  selectedOrderIds,
  onSelectOrder,
  onSelectAll,
  onOpenDriverDialog,
  onOpenPhotoDialog,
  onStatusChange
}) => {
  // Filter orders that are selectable (not already in a trip)
  const selectableOrdersCount = orders.filter(order => !order.tripId).length;

  if (orders.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>No deliveries found for the selected filters.</p>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-[40px] text-center">
                {selectableOrdersCount > 0 ? (
                  <Checkbox 
                    checked={selectedOrderIds.length > 0 && selectedOrderIds.length === selectableOrdersCount}
                    onCheckedChange={onSelectAll}
                    aria-label="Select all orders"
                  />
                ) : null}
              </TableHead>
              <TableHead className="w-[60px]">Order ID</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Delivery</TableHead>
              <TableHead className="w-[110px]">
                <div className="flex items-center">
                  <Car className="h-3.5 w-3.5 mr-1" />
                  Driver
                </div>
              </TableHead>
              <TableHead className="w-[130px]">
                <div className="flex items-center">
                  <CalendarClock className="h-3.5 w-3.5 mr-1" />
                  Delivery Time
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell w-[180px]">Customer</TableHead>
              <TableHead className="hidden md:table-cell w-full">Address</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <DeliveryOrderRow
                key={order.id}
                order={order}
                isSelected={selectedOrderIds.includes(order.id)}
                onSelect={onSelectOrder}
                onOpenDriverDialog={onOpenDriverDialog}
                onOpenPhotoDialog={onOpenPhotoDialog}
                onStatusChange={onStatusChange}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};

export default DeliveryOrdersTable;
