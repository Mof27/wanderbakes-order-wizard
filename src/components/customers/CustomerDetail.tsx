
import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Customer, Order } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { getColorDisplayName } from "@/utils/colorUtils";
import { matchesStatus } from "@/lib/statusHelpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CakeIcon, Calendar, DollarSign, Clock, ChevronDown, ChevronRight, Edit, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface CustomerDetailProps {
  customer: Customer;
}

const CustomerDetail = ({ customer }: CustomerDetailProps) => {
  const { orders } = useApp();
  const [timeFrame, setTimeFrame] = useState<string>("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Filter orders for the current customer
  const customerOrders = useMemo(() => {
    return orders.filter(order => order.customer.id === customer.id);
  }, [orders, customer.id]);

  // Apply time frame filter
  const filteredOrders = useMemo(() => {
    if (timeFrame === "all") {
      return customerOrders;
    }
    
    const now = new Date();
    const pastDate = new Date();
    
    switch(timeFrame) {
      case "30days":
        pastDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        pastDate.setDate(now.getDate() - 90);
        break;
      case "6months":
        pastDate.setMonth(now.getMonth() - 6);
        break;
      case "12months":
        pastDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return customerOrders;
    }
    
    return customerOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= pastDate;
    });
  }, [customerOrders, timeFrame]);
  
  // Calculate metrics
  const totalOrders = customerOrders.length;
  const totalSpend = customerOrders.reduce((sum, order) => sum + order.cakePrice, 0);
  const avgOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;
  const firstOrderDate = customerOrders.length > 0 
    ? new Date(Math.min(...customerOrders.map(o => new Date(o.createdAt).getTime())))
    : null;
  
  // Calculate filtered metrics
  const filteredTotalOrders = filteredOrders.length;
  const filteredTotalSpend = filteredOrders.reduce((sum, order) => sum + order.cakePrice, 0);
  
  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{customer.name}</h3>
              <p className="text-sm">{customer.whatsappNumber}</p>
              {customer.email && <p className="text-sm">{customer.email}</p>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Addresses ({customer.addresses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.addresses.length > 0 ? (
              <div className="space-y-3">
                {customer.addresses.map((address, index) => (
                  <div key={address.id} className="p-3 border rounded-md">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">{address.area}</Badge>
                          <span className="text-xs text-muted-foreground">Address {index + 1}</span>
                        </div>
                        <p className="text-sm">{address.text}</p>
                        {address.deliveryNotes && (
                          <p className="text-xs text-muted-foreground italic">
                            Notes: {address.deliveryNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No addresses saved</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Customer Since</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
              {firstOrderDate ? formatDate(firstOrderDate) : "No orders yet"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Order Summary</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CakeIcon className="mr-2 h-5 w-5 text-cake-primary" />
                  <span className="text-2xl font-bold">{totalOrders}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-2xl font-bold">{formatCurrency(totalSpend)}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="orders" className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Order History</h3>
            <div className="flex items-center gap-2">
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
              <Link to={`/customers/${customer.id}/orders`}>
                <Button variant="outline" size="sm">
                  View All Orders
                </Button>
              </Link>
            </div>
          </div>
          
          {filteredOrders.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <Collapsible
                      key={order.id}
                      open={expandedOrderId === order.id}
                      onOpenChange={() => toggleOrderDetails(order.id)}
                      className="w-full"
                    >
                      <TableRow className="hover:bg-muted/50">
                        <TableCell className="p-0 w-10">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              {expandedOrderId === order.id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {formatDate(order.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`px-2 py-1 rounded-full text-xs inline-block
                            ${matchesStatus(order.status, 'confirmed') ? 'bg-blue-100 text-blue-800' :
                              order.status === 'in-kitchen' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'ready' ? 'bg-green-100 text-green-800' :
                              order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            {formatDate(order.deliveryDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(order.cakePrice)}
                        </TableCell>
                        <TableCell>
                          <Link to={`/orders/${order.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-cake-primary hover:bg-cake-primary/80 text-cake-text h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <tr>
                          <td colSpan={7} className="bg-muted/30 px-4 py-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium mb-2">Order Details</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">Cake Design:</span> {order.cakeDesign}</p>
                                  <p><span className="font-medium">Size:</span> {order.cakeSize}</p>
                                  <p><span className="font-medium">Flavor:</span> {order.cakeFlavor}</p>
                                  <p><span className="font-medium">Cover Color:</span> {getColorDisplayName(order.coverColor)}</p>
                                  {order.cakeText && (
                                    <p><span className="font-medium">Cake Text:</span> {order.cakeText}</p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-2">Delivery Information</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">Delivery Date:</span> {formatDate(order.deliveryDate)}</p>
                                  <p><span className="font-medium">Delivery Address:</span> {order.deliveryAddress}</p>
                                  {order.notes && (
                                    <p><span className="font-medium">Notes:</span> {order.notes}</p>
                                  )}
                                  {order.greetingCard && (
                                    <p><span className="font-medium">Greeting Card:</span> {order.greetingCard}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                              <Link to={`/orders/${order.id}`}>
                                <Button size="sm" className="bg-cake-primary hover:bg-cake-primary/80 text-cake-text">
                                  View Full Order
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 bg-muted/20 rounded-md">
              <CakeIcon className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No orders found for the selected time period</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} orders
            </div>
            <div className="text-sm">
              <span className="font-medium">Total for period:</span> {formatCurrency(filteredTotalSpend)}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetail;
