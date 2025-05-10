
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cake, Check, PlayCircle, X, Trash2, AlertTriangle, ArrowUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BakingTask } from '@/types/baker';

interface BakingTaskCardProps {
  task: BakingTask;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onAcknowledgeCancel?: (taskId: string) => void;
  onDeleteManualTask?: (taskId: string) => void;
  onCancelManualTask?: (taskId: string) => void;
}

const BakingTaskCard: React.FC<BakingTaskCardProps> = ({
  task,
  onStartTask,
  onCompleteTask,
  onAcknowledgeCancel,
  onDeleteManualTask,
  onCancelManualTask,
}) => {
  // Helper to determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-slate-100 text-slate-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Helper to determine urgency indicator
  const UrgencyIndicator = () => {
    if (task.isPriority) {
      // Highest urgency - purple indicator
      return (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-[#9b87f5] border-r-[#9b87f5] border-b-transparent border-l-transparent" />
      );
    } else {
      // Add a subtle urgency indicator based on createdAt
      // Newer tasks get a light amber or gray indicator
      const daysSinceCreation = Math.ceil(
        (new Date().getTime() - task.createdAt.getTime()) / (1000 * 3600 * 24)
      );
      
      if (daysSinceCreation <= 1) {
        // Medium urgency - orange indicator
        return (
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[15px] border-r-[15px] border-t-[#FEC6A1] border-r-[#FEC6A1] border-b-transparent border-l-transparent" />
        );
      } else {
        // Low urgency - gray indicator
        return (
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[10px] border-r-[10px] border-t-[#F1F0FB] border-r-[#F1F0FB] border-b-transparent border-l-transparent" />
        );
      }
    }
  };

  return (
    <Card className={`bg-white shadow-sm hover:shadow-md transition-shadow relative
      ${task.status === 'cancelled' ? 'border-rose-300 bg-rose-50' : ''}
      ${task.isPriority ? 'border-amber-300' : ''}
      ${task.isManual ? 'border-l-4 border-l-purple-400' : ''}`}>
      <UrgencyIndicator />
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Cake className={`h-5 w-5 ${task.status === 'cancelled' ? 'text-rose-500' : 'text-primary'}`} />
            <div>
              <h3 className="font-medium">
                {task.cakeShape} {task.cakeSize}
                {task.isManual && (
                  <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
                    Manual
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">{task.cakeFlavor}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={getStatusColor(task.status)} variant="secondary">
              {task.status === 'in-progress' ? 'In Progress' : 
              task.status === 'cancelled' ? 'Cancelled' : 
              task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </Badge>
            
            {task.isPriority && (
              <Badge className="bg-amber-100 text-amber-700" variant="secondary">
                <AlertTriangle className="h-3 w-3 mr-1" /> Priority
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div>
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="font-medium">
              {task.quantityCompleted} / {task.quantity}
            </p>
          </div>
        </div>

        {task.cancellationReason && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">Cancellation Reason:</p>
            <p className="text-sm text-rose-700">{task.cancellationReason}</p>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {task.status === 'pending' && (
            <>
              <Button
                className="flex-1"
                size="sm"
                onClick={() => onStartTask(task.id)}
              >
                <PlayCircle className="mr-1 h-4 w-4" />
                Start
              </Button>
              
              {/* Delete button for manual tasks only */}
              {task.isManual && onDeleteManualTask && (
                <Button
                  className="flex-none"
                  size="sm"
                  variant="outline"
                  onClick={() => onDeleteManualTask(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
          
          {task.status === 'in-progress' && (
            <Button
              className="flex-1"
              size="sm"
              onClick={() => onCompleteTask(task.id)}
            >
              <Check className="mr-1 h-4 w-4" />
              Complete
            </Button>
          )}
          
          {task.status === 'completed' && (
            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              disabled
            >
              <Check className="mr-1 h-4 w-4" />
              Completed
            </Button>
          )}
          
          {task.status === 'cancelled' && onAcknowledgeCancel && (
            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              onClick={() => onAcknowledgeCancel(task.id)}
            >
              <X className="mr-1 h-4 w-4" />
              Acknowledge
            </Button>
          )}
          
          {/* Cancel button for manual tasks that are pending or in-progress */}
          {task.isManual && 
           ['pending', 'in-progress'].includes(task.status) && 
           onCancelManualTask && (
            <Button
              className="flex-none"
              size="sm"
              variant="outline"
              onClick={() => onCancelManualTask(task.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BakingTaskCard;
