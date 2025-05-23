
import { Order } from "@/types";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import OrderTableRow from "./OrderTableRow";

interface OrderListProps {
  orders: Order[];
  onOrderClick?: (orderId: string) => void;
  renderActions?: (order: Order) => React.ReactNode;
  useWorkflowStatus?: boolean; // Add this prop to control status display
}

const OrderList = ({ 
  orders, 
  onOrderClick, 
  renderActions,
  useWorkflowStatus = true // Default to using workflow status in Orders page
}: OrderListProps) => {
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
            <TableHead className="w-[100px]">Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Delivery Date</TableHead>
            <TableHead>Cake</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <OrderTableRow 
              key={order.id} 
              order={order} 
              onClick={() => onOrderClick && onOrderClick(order.id)}
              customActions={renderActions ? renderActions(order) : undefined}
              useWorkflowStatus={useWorkflowStatus}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderList;
