
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cake, Check, PlayCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BakingTask } from '@/types/baker';
import { formatDistanceToNow } from 'date-fns';

interface BakingTaskCardProps {
  task: BakingTask;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onAcknowledgeCancel?: (taskId: string) => void;
}

const BakingTaskCard: React.FC<BakingTaskCardProps> = ({
  task,
  onStartTask,
  onCompleteTask,
  onAcknowledgeCancel,
}) => {
  // Helper to format due date
  const formatDueDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

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
    <Card className={`bg-white shadow-sm hover:shadow-md transition-shadow ${task.status === 'cancelled' ? 'border-rose-300 bg-rose-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Cake className={`h-5 w-5 ${task.status === 'cancelled' ? 'text-rose-500' : 'text-primary'}`} />
            <div>
              <h3 className="font-medium">
                {task.cakeShape} {task.cakeSize}
              </h3>
              <p className="text-sm text-muted-foreground">{task.cakeFlavor}</p>
            </div>
          </div>
          <Badge className={getStatusColor(task.status)} variant="secondary">
            {task.status === 'in-progress' ? 'In Progress' : 
             task.status === 'cancelled' ? 'Cancelled' : 
             task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="font-medium">
              {task.quantityCompleted} / {task.quantity}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Due</p>
            <p className="font-medium">{formatDueDate(task.dueDate)}</p>
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
            <Button
              className="flex-1"
              size="sm"
              onClick={() => onStartTask(task.id)}
            >
              <PlayCircle className="mr-1 h-4 w-4" />
              Start
            </Button>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default BakingTaskCard;
