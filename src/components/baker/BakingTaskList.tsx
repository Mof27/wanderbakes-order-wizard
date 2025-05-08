
import React from 'react';
import { BakingTask } from '@/types/baker';
import BakingTaskCard from './BakingTaskCard';

interface BakingTaskListProps {
  tasks: BakingTask[];
  filter: string;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

const BakingTaskList: React.FC<BakingTaskListProps> = ({
  tasks,
  filter,
  onStartTask,
  onCompleteTask,
}) => {
  // Filter tasks based on selected filter
  const filteredTasks = React.useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter(task => task.status === filter);
  }, [tasks, filter]);

  // Sort tasks by due date (closest due date first)
  const sortedTasks = React.useMemo(() => {
    return [...filteredTasks].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BakingTaskList;
