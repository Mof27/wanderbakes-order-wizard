
import React from 'react';
import { BakingTask } from '@/types/baker';
import BakingTaskCard from './BakingTaskCard';

interface BakingTaskListProps {
  tasks: BakingTask[];
  filter: string;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onAcknowledgeCancel?: (taskId: string) => void;
  onDeleteManualTask?: (taskId: string) => void;
  onCancelManualTask?: (taskId: string) => void;
}

const BakingTaskList: React.FC<BakingTaskListProps> = ({
  tasks,
  filter,
  onStartTask,
  onCompleteTask,
  onAcknowledgeCancel,
  onDeleteManualTask,
  onCancelManualTask,
}) => {
  // Filter tasks based on selected filter
  const filteredTasks = React.useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter(task => task.status === filter);
  }, [tasks, filter]);

  // Sort tasks: priority first, then by creation date (newest first)
  const sortedTasks = React.useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      // Priority tasks come first
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      
      // Then sort by creation date (newer tasks first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [filteredTasks]);

  return (
    <div>
      {sortedTasks.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-md border border-dashed">
          <p className="text-muted-foreground">No tasks matching the current filter</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedTasks.map((task) => (
            <BakingTaskCard
              key={task.id}
              task={task}
              onStartTask={onStartTask}
              onCompleteTask={onCompleteTask}
              onAcknowledgeCancel={onAcknowledgeCancel}
              onDeleteManualTask={onDeleteManualTask}
              onCancelManualTask={onCancelManualTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BakingTaskList;
