
import { OrderStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Add missing Badge import
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
      stage: "Photo Approval",
      statuses: ["pending-approval", "needs-revision"],
      page: "Delivery / Orders",
      components: ["CakePhotoApprovalDialog", "CakePhotoUploadDialog"],
      nextAction: "Approve Photos / Request Revision"
    },
    {
      stage: "Delivery Management",
      statuses: ["ready-to-deliver", "in-delivery"],
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
                              ${status === "pending-approval" ? "bg-indigo-100 text-indigo-800" : ""}
                              ${status === "needs-revision" ? "bg-amber-100 text-amber-800" : ""}
                              ${status === "ready-to-deliver" ? "bg-green-100 text-green-800" : ""}
                              ${status === "in-delivery" ? "bg-orange-100 text-orange-800" : ""}
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
          <CardTitle>Photo Approval Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The new photo approval process ensures that cake photos are reviewed before an order can proceed to delivery. 
              This helps maintain quality control and ensures the final product meets expectations.
            </p>
            
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-4 border-b">
                <div className="bg-muted p-3 font-medium border-r md:col-span-1">Kitchen</div>
                <div className="p-3 md:col-span-3">
                  Uploads cake photos, triggering status change to <Badge className="bg-indigo-100 text-indigo-800">Pending Approval</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 border-b">
                <div className="bg-muted p-3 font-medium border-r md:col-span-1">Manager</div>
                <div className="p-3 md:col-span-3">
                  Reviews photos and either approves them (status changes to <Badge className="bg-green-100 text-green-800">Ready to Deliver</Badge>) 
                  or requests revision with feedback (status changes to <Badge className="bg-amber-100 text-amber-800">Needs Revision</Badge>)
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4">
                <div className="bg-muted p-3 font-medium border-r md:col-span-1">Kitchen</div>
                <div className="p-3 md:col-span-3">
                  If revision requested, makes changes and re-uploads photos (status returns to <Badge className="bg-indigo-100 text-indigo-800">Pending Approval</Badge>)
                </div>
              </div>
            </div>
            
            <p className="text-sm italic">
              This process repeats until photos are approved, after which the cake can proceed to delivery.
            </p>
            
            <Separator />
            
            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="font-semibold">Benefits</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                <li>Ensures quality control before customer delivery</li>
                <li>Provides clear feedback for improvements when needed</li>
                <li>Tracks revision history for accountability and learning</li>
                <li>Prevents delivery of cakes that don't meet standards</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowPage;
