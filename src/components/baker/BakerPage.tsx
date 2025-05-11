import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services';
import { BakingTask, BakerPageTab, TaskFilter, QualityCheck } from '@/types/baker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cake, Layers, FileText, X, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import BakingTaskList from './BakingTaskList';
import InventorySection from './InventorySection';
import ProductionLogTable from './ProductionLogTable';
import BakingCompletionForm from './BakingCompletionForm';
import ManualBakingTaskForm from './ManualBakingTaskForm';
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
  const [isManualTaskFormOpen, setIsManualTaskFormOpen] = useState(false);
  const [taskToCancel, setTaskToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  
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
  
  // Sync tasks with orders and check for priority tasks
  useEffect(() => {
    const syncTasks = async () => {
      try {
        console.log("Syncing baker tasks with orders...");
        const orders = await dataService.orders.getAll();
        console.log("Orders fetched:", orders);
        
        // Filter orders to log which ones would qualify for baker tasks
        const qualifyingOrders = orders.filter(order => 
          order.status === 'in-kitchen' && order.kitchenStatus === 'waiting-baker'
        );
        console.log("Qualifying orders for baker tasks:", qualifyingOrders);
        
        const newTasks = await dataService.baker.aggregateOrdersIntoTasks(orders);
        console.log("New baker tasks created:", newTasks);
        
        // Check for priority tasks (same day delivery)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tasksToUpdate = tasks.filter(task => {
          if (task.orderIds && task.orderIds.length > 0) {
            // Find matching orders
            const relatedOrders = orders.filter(order => 
              task.orderIds?.includes(order.id)
            );
            
            // Check if any order is for today
            const hasSameDayDelivery = relatedOrders.some(order => {
              const deliveryDate = new Date(order.deliveryDate);
              deliveryDate.setHours(0, 0, 0, 0);
              return deliveryDate.getTime() === today.getTime();
            });
            
            return hasSameDayDelivery && !task.isPriority;
          }
          return false;
        });
        
        // Update tasks that need to be prioritized
        for (const task of tasksToUpdate) {
          await dataService.baker.update(task.id, { isPriority: true });
        }
        
        if (tasksToUpdate.length > 0) {
          queryClient.invalidateQueries({ queryKey: ['bakingTasks'] });
        }
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
  }, [queryClient, toast, tasks]);
  
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
  
  const acknowledgeCancelMutation = useMutation({
    mutationFn: (taskId: string) => {
      return dataService.baker.acknowledgeCancelledTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bakingTasks'] });
      queryClient.invalidateQueries({ queryKey: ['productionLog'] });
      
      toast({
        title: "Task Acknowledged",
        description: "The cancelled task has been acknowledged and removed."
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
        isManual: task.isManual
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
  
  const createManualTaskMutation = useMutation({
    mutationFn: (data: {
      cakeShape: string;
      cakeSize: string;
      cakeFlavor: string;
      quantity: number;
      notes?: string;
    }) => {
      // Pass only the fields expected by the repository method
      return dataService.baker.createManualTask({
        ...data,
        dueDate: new Date(), // Use current date for priority calculation
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bakingTasks'] });
      
      setIsManualTaskFormOpen(false);
      
      toast({
        title: "Task Created",
        description: "A new manual baking task has been created."
      });
    }
  });
  
  const deleteManualTaskMutation = useMutation({
    mutationFn: (taskId: string) => {
      return dataService.baker.deleteManualTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bakingTasks'] });
      queryClient.invalidateQueries({ queryKey: ['productionLog'] });
      
      toast({
        title: "Task Deleted",
        description: "The manual task has been deleted."
      });
    }
  });
  
  const cancelManualTaskMutation = useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason: string }) => {
      return dataService.baker.cancelManualTask(taskId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bakingTasks'] });
      
      setIsCancelDialogOpen(false);
      setTaskToCancel(null);
      setCancelReason('');
      
      toast({
        title: "Task Cancelled",
        description: "The manual task has been cancelled."
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
  
  const handleAcknowledgeCancel = (taskId: string) => {
    acknowledgeCancelMutation.mutate(taskId);
  };
  
  const handleCompleteTask = (data: {
    taskId: string;
    quantity: number;
    qualityChecks: QualityCheck;
    notes?: string;
  }) => {
    completeProductionMutation.mutate(data);
  };
  
  const handleCreateManualTask = (data: {
    cakeShape: string;
    cakeSize: string;
    cakeFlavor: string;
    quantity: number;
    notes?: string;
  }) => {
    createManualTaskMutation.mutate(data);
  };
  
  const handleDeleteManualTask = (taskId: string) => {
    deleteManualTaskMutation.mutate(taskId);
  };
  
  const handleInitiateCancelManualTask = (taskId: string) => {
    setTaskToCancel(taskId);
    setCancelReason('');
    setIsCancelDialogOpen(true);
  };
  
  const handleConfirmCancelManualTask = () => {
    if (taskToCancel) {
      cancelManualTaskMutation.mutate({ 
        taskId: taskToCancel, 
        reason: cancelReason || 'Cancelled by baker' 
      });
    }
  };
  
  // Count tasks by status
  const pendingTasksCount = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasksCount = tasks.filter(task => task.status === 'in-progress').length;
  const completedTasksCount = tasks.filter(task => task.status === 'completed').length;
  const cancelledTasksCount = tasks.filter(task => task.status === 'cancelled').length;
  
  // Count manual tasks
  const manualTasksCount = tasks.filter(task => task.isManual).length;
  
  // Count priority tasks
  const priorityTasksCount = tasks.filter(task => task.isPriority).length;
  
  // Total inventory count
  const totalInventoryCount = inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Baker Workstation</h1>
          <p className="text-muted-foreground">
            Manage cake production and inventory
          </p>
        </div>
      </div>

      {/* Condensed status cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-2 bg-orange-50">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-orange-100 rounded-full">
              <Cake className="h-4 w-4 text-orange-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold">{pendingTasksCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-2 bg-blue-50">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-100 rounded-full">
              <Cake className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-lg font-semibold">{inProgressTasksCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-2 bg-amber-50">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-amber-100 rounded-full">
              <Cake className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Priority</p>
              <p className="text-lg font-semibold">{priorityTasksCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-2 bg-green-50">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-green-100 rounded-full">
              <Layers className="h-4 w-4 text-green-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Stock</p>
              <p className="text-lg font-semibold">{totalInventoryCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BakerPageTab)}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <TabsList className="grid w-full sm:w-auto grid-cols-3">
            <TabsTrigger value="tasks">
              <Cake className="h-4 w-4 mr-2" />
              <span>Baking Tasks</span>
              {manualTasksCount > 0 && (
                <Badge className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
                  {manualTasksCount}
                </Badge>
              )}
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
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeTab === 'tasks' && (
              <>
                <Select value={taskFilter} onValueChange={(value) => setTaskFilter(value as TaskFilter)} className="w-32">
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={() => setIsManualTaskFormOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Manual Task
                </Button>
              </>
            )}
          </div>
        </div>
        
        <TabsContent value="tasks" className="mt-3">
          {isLoadingTasks ? (
            <div className="text-center p-4">Loading tasks...</div>
          ) : (
            <BakingTaskList
              tasks={tasks}
              filter={taskFilter}
              onStartTask={handleStartTask}
              onCompleteTask={handleShowCompletionForm}
              onAcknowledgeCancel={handleAcknowledgeCancel}
              onDeleteManualTask={handleDeleteManualTask}
              onCancelManualTask={handleInitiateCancelManualTask}
            />
          )}
        </TabsContent>
        
        <TabsContent value="inventory" className="mt-3">
          <h2 className="font-semibold mb-3">Cake Inventory</h2>
          {isLoadingInventory ? (
            <div className="text-center p-4">Loading inventory...</div>
          ) : (
            <InventorySection inventory={inventory} />
          )}
        </TabsContent>
        
        <TabsContent value="log" className="mt-3">
          <h2 className="font-semibold mb-3">Production Log</h2>
          {isLoadingLog ? (
            <div className="text-center p-4">Loading production logs...</div>
          ) : (
            <ProductionLogTable logs={productionLog} />
          )}
        </TabsContent>
      </Tabs>
      
      {/* Task completion dialog */}
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
      
      {/* Manual task creation dialog */}
      <Dialog open={isManualTaskFormOpen} onOpenChange={setIsManualTaskFormOpen}>
        <DialogContent className={isMobile ? "max-w-full p-4" : "max-w-md"}>
          <ManualBakingTaskForm 
            onSubmit={handleCreateManualTask}
            onCancel={() => setIsManualTaskFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Cancel manual task dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className={isMobile ? "max-w-full p-4" : "max-w-md"}>
          <h2 className="text-lg font-semibold mb-4">Cancel Manual Task</h2>
          <div className="space-y-4">
            <p>Are you sure you want to cancel this manual task?</p>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="cancelReason">
                Cancellation Reason (Optional):
              </label>
              <textarea
                id="cancelReason"
                className="w-full border rounded-md p-2"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCancelDialogOpen(false)}
              >
                No, Keep Task
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmCancelManualTask}
              >
                Yes, Cancel Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BakerPage;
