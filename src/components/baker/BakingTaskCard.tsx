
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cake, Check, PlayCircle, X, AlertTriangle } from 'lucide-react';
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

  return (
    <Card className={`bg-white shadow-sm hover:shadow-md transition-shadow relative
      ${task.status === 'cancelled' ? 'border-rose-300 bg-rose-50' : ''}
      ${task.isPriority ? 'border-amber-300' : ''}
      ${task.isManual ? 'border-l-4 border-l-purple-400' : ''}`}>
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5">
            <Cake className={`h-4 w-4 ${task.status === 'cancelled' ? 'text-rose-500' : 'text-primary'}`} />
            <div>
              <h3 className="font-medium text-sm">
                {task.cakeShape} {task.cakeSize}
                {task.isManual && (
                  <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-700 border-purple-300 text-[10px] px-1 py-0" size="xs">
                    Manual
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">{task.cakeFlavor}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={getStatusColor(task.status)} variant="secondary" size="sm">
              {task.status === 'in-progress' ? 'In Progress' : 
              task.status === 'cancelled' ? 'Cancelled' : 
              task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </Badge>
            
            {task.isPriority && (
              <Badge className="bg-amber-100 text-amber-700" variant="secondary" size="xs">
                <AlertTriangle className="h-3 w-3 mr-0.5" /> Priority
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="font-medium text-sm">
              {task.quantityCompleted} / {task.quantity}
            </p>
          </div>
        </div>

        {task.cancellationReason && (
          <div className="mt-1.5 text-xs">
            <p className="text-muted-foreground">Cancellation:</p>
            <p className="text-rose-700">{task.cancellationReason}</p>
          </div>
        )}

        <div className="mt-3 flex gap-1.5">
          {task.status === 'pending' && (
            <Button
              className="flex-1 text-xs h-8"
              size="sm"
              onClick={() => onStartTask(task.id)}
            >
              <PlayCircle className="mr-1 h-3.5 w-3.5" />
              Start
            </Button>
          )}
          
          {task.status === 'in-progress' && (
            <Button
              className="flex-1 text-xs h-8"
              size="sm"
              onClick={() => onCompleteTask(task.id)}
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Complete
            </Button>
          )}
          
          {task.status === 'completed' && (
            <Button
              className="flex-1 text-xs h-8"
              size="sm"
              variant="outline"
              disabled
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Completed
            </Button>
          )}
          
          {task.status === 'cancelled' && onAcknowledgeCancel && (
            <Button
              className="flex-1 text-xs h-8"
              size="sm"
              variant="outline"
              onClick={() => onAcknowledgeCancel(task.id)}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Acknowledge
            </Button>
          )}
          
          {/* Only show cancel button for manual tasks that are pending or in-progress */}
          {task.isManual && 
           ['pending', 'in-progress'].includes(task.status) && 
           onCancelManualTask && (
            <Button
              className="flex-1 h-8"
              size="sm"
              variant="outline"
              onClick={() => onCancelManualTask(task.id)}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BakingTaskCard;
