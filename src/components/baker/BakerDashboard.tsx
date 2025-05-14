
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cake, CalendarRange, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const BakerDashboard: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const todayTasks = [
    { id: 1, orderNumber: "ORD-2023-001", cakeType: "Chocolate", dueTime: "10:00 AM", status: "pending" },
    { id: 2, orderNumber: "ORD-2023-002", cakeType: "Vanilla", dueTime: "12:30 PM", status: "in-progress" },
    { id: 3, orderNumber: "ORD-2023-003", cakeType: "Red Velvet", dueTime: "3:00 PM", status: "pending" },
  ];
  
  const handleRefresh = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Dashboard Refreshed",
        description: "Latest baking tasks have been loaded",
      });
    }, 1000);
  };
  
  const handleMarkComplete = (id: number) => {
    toast({
      title: "Task Completed",
      description: `Order #${id} marked as complete`,
    });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            Today's Tasks
          </CardTitle>
          <CardDescription>
            Cakes to bake for today's orders
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {todayTasks.length > 0 ? (
            <div className="space-y-4">
              {todayTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-medium">{task.orderNumber}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Cake className="h-4 w-4" />
                      <span>{task.cakeType}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Due by {task.dueTime}</span>
                    </div>
                  </div>
                  <Button 
                    variant={task.status === "in-progress" ? "secondary" : "outline"} 
                    size="sm"
                    onClick={() => handleMarkComplete(task.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {task.status === "in-progress" ? "Finish" : "Start"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">No tasks scheduled for today</p>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh Tasks"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-muted/30">
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>At a glance bakery metrics</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Today's Orders</p>
            </div>
            <div className="bg-secondary/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div className="bg-accent/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Tomorrow</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">93%</p>
              <p className="text-sm text-muted-foreground">On-time Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-muted/30">
          <CardTitle>Inventory Alerts</CardTitle>
          <CardDescription>Items running low</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span>Flour (All Purpose)</span>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Low</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span>Butter</span>
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Very Low</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span>Vanilla Extract</span>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Low</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Cake Boxes (Medium)</span>
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Very Low</span>
            </div>
          </div>
          <div className="mt-4">
            <Button size="sm" className="w-full">View Full Inventory</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BakerDashboard;
