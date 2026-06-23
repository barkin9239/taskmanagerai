import { useDroppable } from '@dnd-kit/core';
import type { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';

const LABELS: Record<TaskStatus, string> = {
  Todo:       'To Do',
  InProgress: 'In Progress',
  Done:       'Done',
};

const ACCENT: Record<TaskStatus, string> = {
  Todo:       'bg-slate-400',
  InProgress: 'bg-indigo-500',
  Done:       'bg-emerald-500',
};

interface Props {
  status: TaskStatus;
  tasks: Task[];
  showCreator?: boolean;
  onTaskClick: (task: Task) => void;
}

export default function KanbanColumn({ status, tasks, showCreator = false, onTaskClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col bg-gray-50 rounded-2xl min-h-32">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-gray-200">
        <span className={`w-2 h-2 rounded-full ${ACCENT[status]}`} />
        <h2 className="text-sm font-semibold text-gray-700">{LABELS[status]}</h2>
        <span className="ml-auto text-xs font-medium bg-gray-200 text-gray-500 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Drop zone — covers full column body */}
      <div
        ref={setNodeRef}
        className={`p-3 flex-1 rounded-b-2xl transition-colors min-h-20 ${isOver ? 'bg-indigo-50 ring-2 ring-indigo-200 ring-inset' : ''}`}
      >
        {tasks.length === 0 && !isOver ? (
          <p className="text-xs text-gray-400 text-center py-6">No tasks</p>
        ) : (
          tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              showCreator={showCreator}
              onClick={() => onTaskClick(t)}
            />
          ))
        )}
      </div>
    </div>
  );
}
