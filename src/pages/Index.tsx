
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CakeIcon, CalendarIcon, CheckIcon, Clock, Plus, Users } from "lucide-react";
const Dashboard = () => {
  const {
    orders,
    customers
  } = useApp();
  const upcomingDeliveries = orders.filter(order => order.status !== "delivered" && order.status !== "cancelled" && new Date(order.deliveryDate) >= new Date()).sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

  // Order statistics
  const totalOrders = orders.length;
  // Remove confirmed orders count
  const inProgressOrders = orders.filter(order => order.status === "in-kitchen").length;
  const readyOrders = orders.filter(order => order.status === "ready").length;
  const deliveredOrders = orders.filter(order => order.status === "delivered").length;
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link to="/orders/new">
          <Button className="bg-cake-primary hover:bg-cake-primary/80 text-gray-50">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Orders</p>
              <p className="text-3xl font-bold">{totalOrders}</p>
            </div>
            <div className="bg-cake-primary/20 p-3 rounded-full">
              <CakeIcon className="h-6 w-6 text-cake-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">In Progress</p>
              <p className="text-3xl font-bold">{inProgressOrders}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Ready for Pickup</p>
              <p className="text-3xl font-bold">{readyOrders}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Customers</p>
              <p className="text-3xl font-bold">{customers.length}</p>
            </div>
            <div className="bg-cake-secondary/20 p-3 rounded-full">
              <Users className="h-6 w-6 text-cake-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Upcoming Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeliveries.length > 0 ? <div className="space-y-4">
                {upcomingDeliveries.slice(0, 5).map(order => <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted p-2 rounded">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {order.cakeDesign} ({order.cakeSize})
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          For {order.customer.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {new Date(order.deliveryDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                  })}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {order.status.replace("-", " ")}
                      </p>
                    </div>
                  </div>)}
              </div> : <p className="text-muted-foreground py-6 text-center">
                No upcoming deliveries
              </p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Incomplete</span>
                  <div className="w-full max-w-[70%] bg-muted rounded-full h-2.5">
                    <div className="bg-gray-400 h-2.5 rounded-full" style={{
                    width: `${orders.filter(o => o.status === "incomplete").length / totalOrders * 100}%`
                  }}></div>
                  </div>
                  <span className="ml-2 font-medium">{orders.filter(o => o.status === "incomplete").length}</span>
                </div>

                {/* Remove Confirmed status bar */}

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">In Progress</span>
                  <div className="w-full max-w-[70%] bg-muted rounded-full h-2.5">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{
                    width: `${inProgressOrders / totalOrders * 100}%`
                  }}></div>
                  </div>
                  <span className="ml-2 font-medium">{inProgressOrders}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ready</span>
                  <div className="w-full max-w-[70%] bg-muted rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{
                    width: `${readyOrders / totalOrders * 100}%`
                  }}></div>
                  </div>
                  <span className="ml-2 font-medium">{readyOrders}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Delivered</span>
                  <div className="w-full max-w-[70%] bg-muted rounded-full h-2.5">
                    <div className="bg-purple-500 h-2.5 rounded-full" style={{
                    width: `${deliveredOrders / totalOrders * 100}%`
                  }}></div>
                  </div>
                  <span className="ml-2 font-medium">{deliveredOrders}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cancelled</span>
                  <div className="w-full max-w-[70%] bg-muted rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{
                    width: `${orders.filter(o => o.status === "cancelled").length / totalOrders * 100}%`
                  }}></div>
                  </div>
                  <span className="ml-2 font-medium">{orders.filter(o => o.status === "cancelled").length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Dashboard;
