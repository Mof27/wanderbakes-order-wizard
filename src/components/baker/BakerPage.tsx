import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services';
import { BakingTask, BakerPageTab, TaskFilter, QualityCheck } from '@/types/baker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cake, Layers, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import BakingTaskList from './BakingTaskList';
import InventorySection from './InventorySection';
import ProductionLogTable from './ProductionLogTable';
import BakingCompletionForm from './BakingCompletionForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';

const BakerPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // State
  const [activeTab, setActiveTab] = useState<BakerPageTab>('tasks');
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
  const [selectedTask, setSelectedTask] = useState<BakingTask | null>(null);
  const [isCompletionFormOpen, setIsCompletionFormOpen] = useState(false);
  
  // Fetch data
  const { 
    data: tasks = [],
    isLoading: isLoadingTasks 
  } = useQuery({
    queryKey: ['bakingTasks'],
    queryFn: () => dataService.baker.getAll(),
  });
  
  const { 
    data: inventory = [],
    isLoading: isLoadingInventory 
  } = useQuery({
    queryKey: ['cakeInventory'],
    queryFn: () => dataService.baker.getCakeInventory(),
  });
  
  const {
    data: productionLog = [],
    isLoading: isLoadingLog
  } = useQuery({
    queryKey: ['productionLog'],
    queryFn: () => dataService.baker.getProductionLog(),
  });
  
  // Sync tasks with orders on component mount and when tab is changed
  useEffect(() => {
    const syncTasks = async () => {
      try {
        console.log("Syncing baker tasks with orders...");
        const orders = await dataService.orders.getAll();
        console.log("Orders fetched:", orders);
        
        // Filter orders to log which ones would qualify for baker tasks
        const qualifyingOrders = orders.filter(order => 
          order.status === 'in-queue' || 
          (order.status === 'in-kitchen' && order.kitchenStatus === 'waiting-baker')
        );
        console.log("Qualifying orders for baker tasks:", qualifyingOrders);
        
        const newTasks = await dataService.baker.aggregateOrdersIntoTasks(orders);
        console.log("New baker tasks created:", newTasks);
        
        queryClient.invalidateQueries({ queryKey: ['bakingTasks'] });
      } catch (error) {
        console.error("Error syncing baker tasks:", error);
        toast({
          title: "Sync Error",
          description: "Failed to sync orders with baker tasks",
          variant: "destructive"
        });
      }
    };
    
    syncTasks();
    
    // Set up an interval to sync tasks every minute
    const intervalId = setInterval(syncTasks, 60000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [queryClient, toast]);
  
  // Mutations
  const startTaskMutation = useMutation({
    mutationFn: (taskId: string) => {
      return dataService.baker.update(taskId, {
        status: 'in-progress',
        updatedAt: new Date()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bakingTasks'] });
      toast({
        title: "Task Started",
        description: "The task has been marked as in progress."
      });
    }
  });
  
  const completeProductionMutation = useMutation({
    mutationFn: (data: {
      taskId: string;
      quantity: number;
      qualityChecks: QualityCheck;
      notes?: string;
    }) => {
      const task = tasks.find(t => t.id === data.taskId);
      if (!task) throw new Error("Task not found");
      
      return dataService.baker.createProductionEntry({
        taskId: data.taskId,
        cakeShape: task.cakeShape,
        cakeSize: task.cakeSize,
        cakeFlavor: task.cakeFlavor,
        quantity: data.quantity,
        completedAt: new Date(),
        qualityChecks: data.qualityChecks,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bakingTasks'] });
      queryClient.invalidateQueries({ queryKey: ['cakeInventory'] });
      queryClient.invalidateQueries({ queryKey: ['productionLog'] });
      
      setIsCompletionFormOpen(false);
      setSelectedTask(null);
      
      toast({
        title: "Production Recorded",
        description: "The completed cakes have been added to inventory."
      });
    }
  });
  
  // Event handlers
  const handleStartTask = (taskId: string) => {
    startTaskMutation.mutate(taskId);
  };
  
  const handleShowCompletionForm = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsCompletionFormOpen(true);
    }
  };
  
  const handleCompleteTask = (data: {
    taskId: string;
    quantity: number;
    qualityChecks: QualityCheck;
    notes?: string;
  }) => {
    completeProductionMutation.mutate(data);
  };
  
  // Count tasks by status
  const pendingTasksCount = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasksCount = tasks.filter(task => task.status === 'in-progress').length;
  const completedTasksCount = tasks.filter(task => task.status === 'completed').length;
  
  // Total inventory count
  const totalInventoryCount = inventory.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Baker Workstation</h1>
          <p className="text-muted-foreground">
            Manage cake production and inventory
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 bg-orange-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-full">
              <Cake className="h-5 w-5 text-orange-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
              <p className="text-2xl font-semibold">{pendingTasksCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-blue-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <Cake className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-semibold">{inProgressTasksCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-green-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-full">
              <Layers className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cakes in Stock</p>
              <p className="text-2xl font-semibold">{totalInventoryCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BakerPageTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">
            <Cake className="h-4 w-4 mr-2" />
            <span>Baking Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Layers className="h-4 w-4 mr-2" />
            <span>Cake Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="log">
            <FileText className="h-4 w-4 mr-2" />
            <span>Production Log</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Baking Tasks</h2>
            <Select value={taskFilter} onValueChange={(value) => setTaskFilter(value as TaskFilter)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          {isLoadingTasks ? (
            <div className="text-center p-8">Loading tasks...</div>
          ) : (
            <BakingTaskList
              tasks={tasks}
              filter={taskFilter}
              onStartTask={handleStartTask}
              onCompleteTask={handleShowCompletionForm}
            />
          )}
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4 mt-4">
          <h2 className="font-semibold">Cake Inventory</h2>
          <Separator />
          {isLoadingInventory ? (
            <div className="text-center p-8">Loading inventory...</div>
          ) : (
            <InventorySection inventory={inventory} />
          )}
        </TabsContent>
        
        <TabsContent value="log" className="space-y-4 mt-4">
          <h2 className="font-semibold">Production Log</h2>
          <Separator />
          {isLoadingLog ? (
            <div className="text-center p-8">Loading production logs...</div>
          ) : (
            <ProductionLogTable logs={productionLog} />
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={isCompletionFormOpen} onOpenChange={setIsCompletionFormOpen}>
        <DialogContent className={isMobile ? "max-w-full p-4" : "max-w-md"}>
          {selectedTask && (
            <BakingCompletionForm
              task={selectedTask}
              onComplete={handleCompleteTask}
              onCancel={() => setIsCompletionFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BakerPage;
