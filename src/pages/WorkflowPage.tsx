
import { OrderStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const WorkflowPage = () => {
  // Define the status flow stages
  const statusFlow: {
    stage: string;
    statuses: OrderStatus[];
    page: string;
    components: string[];
    nextAction: string;
  }[] = [
    {
      stage: "Order Creation",
      statuses: ["incomplete"],
      page: "New Order / Edit Order",
      components: ["OrderForm"],
      nextAction: "Complete Order"
    },
    {
      stage: "Queue Management",
      statuses: ["in-queue"],
      page: "Orders",
      components: ["OrderStatusDropdown"],
      nextAction: "Start Production"
    },
    {
      stage: "Kitchen Production",
      statuses: ["in-kitchen", "waiting-photo"],
      page: "Kitchen",
      components: ["StartProductionButton", "NextStatusButton", "KitchenStatusDropdown"],
      nextAction: "Complete Production / Upload Photos"
    },
    {
      stage: "Delivery Management",
      statuses: ["ready-to-deliver", "in-delivery", "delivery-confirmed"],
      page: "Delivery / Edit Order",
      components: ["DeliveryStatusManager", "DeliveryInfoDialog"],
      nextAction: "Start/Complete Delivery"
    },
    {
      stage: "Feedback Collection",
      statuses: ["waiting-feedback"],
      page: "Edit Order",
      components: ["DeliveryRecapSection"],
      nextAction: "Collect Feedback"
    },
    {
      stage: "Order Completion",
      statuses: ["finished", "cancelled"],
      page: "Orders",
      components: ["OrderStatusDropdown"],
      nextAction: "Archive"
    }
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Helmet>
        <title>Order Workflow | Cake Shop</title>
      </Helmet>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order Workflow Visualization</h1>
        <div className="flex gap-2">
          <Link to="/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
        </div>
      </div>
      
      <Alert className="bg-amber-50 border-amber-200">
        <AlertDescription className="text-amber-800">
          This page provides a visual guide to the order status workflow in the system.
          It shows which pages and components handle each status transition.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Order Status Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Stage</TableHead>
                  <TableHead>Statuses</TableHead>
                  <TableHead>Managed In</TableHead>
                  <TableHead>UI Components</TableHead>
                  <TableHead>Next Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusFlow.map((stage, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{stage.stage}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {stage.statuses.map((status) => (
                          <span 
                            key={status}
                            className={`px-2 py-1 rounded-full text-xs font-medium 
                              ${status === "incomplete" ? "bg-gray-200 text-gray-800" : ""}
                              ${status === "in-queue" ? "bg-blue-100 text-blue-800" : ""}
                              ${status === "in-kitchen" ? "bg-yellow-100 text-yellow-800" : ""}
                              ${status === "waiting-photo" ? "bg-purple-100 text-purple-800" : ""}
                              ${status === "ready-to-deliver" ? "bg-green-100 text-green-800" : ""}
                              ${status === "in-delivery" ? "bg-orange-100 text-orange-800" : ""}
                              ${status === "delivery-confirmed" ? "bg-teal-100 text-teal-800" : ""}
                              ${status === "waiting-feedback" ? "bg-indigo-100 text-indigo-800" : ""}
                              ${status === "finished" ? "bg-lime-100 text-lime-800" : ""}
                              ${status === "cancelled" ? "bg-red-100 text-red-800" : ""}
                            `}
                          >
                            {status.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{stage.page}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {stage.components.map((comp, i) => (
                          <span key={i} className="text-sm font-mono">{comp}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span>{stage.nextAction}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold">Data Duplication</h3>
              <p className="text-sm text-muted-foreground">
                Delivery information (photos, time, feedback) is collected in both DeliveryInfoDialog 
                and DeliveryRecapSection, creating inconsistent workflows.
              </p>
            </div>
            
            <Separator />
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold">Solution</h3>
              <p className="text-sm text-muted-foreground">
                Make DeliveryInfoDialog the single source of truth for all delivery information.
                DeliveryRecapSection should only display information, with an "Edit" button 
                to trigger the dialog for editing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowPage;
