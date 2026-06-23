import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task, TaskPriority } from '../types';

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  Low:    'bg-gray-100 text-gray-500',
  Medium: 'bg-blue-100 text-blue-700',
  High:   'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

interface Props {
  task: Task;
  showCreator?: boolean;
  onClick: () => void;
}

export default function TaskCard({ task, showCreator = false, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const done     = task.subTasks.filter((s) => s.isCompleted).length;
  const total    = task.subTasks.length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 mb-2.5 transition-shadow hover:shadow-md hover:border-indigo-100 group"
    >
      {/* Card body — clickable */}
      <div onClick={onClick} className="p-3.5 cursor-pointer">
        {/* Header row */}
        <div className="flex items-start gap-2 mb-1.5">
          {/* Drag handle — separate from click area */}
          <div
            {...listeners}
            {...attributes}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 mt-0.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
            </svg>
          </div>

          <h3 className="flex-1 text-sm font-medium text-gray-800 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
            {task.title}
          </h3>

          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[task.priority]}`}>
            {task.priority}
          </span>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2 leading-relaxed pl-5">
            {task.description}
          </p>
        )}

        {/* Creator (assigned-to-me view) */}
        {showCreator && task.createdByName && (
          <div className="flex items-center gap-1 mb-1.5 pl-5">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span className="text-[10px] text-gray-500">by {task.createdByName}</span>
          </div>
        )}

        {/* Assignee (created-by-me view) */}
        {!showCreator && (
          <div className="flex items-center gap-1 mb-1.5 pl-5">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span className="text-[10px] text-gray-500">
              {task.assignedToUserName ? task.assignedToUserName : 'Unassigned'}
            </span>
          </div>
        )}

        {/* Subtask progress */}
        {total > 0 && (
          <div className="flex items-center gap-2 mt-2 pl-5">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${progress}%` }}/>
            </div>
            <span className="text-[10px] text-gray-400 tabular-nums">{done}/{total}</span>
          </div>
        )}

        {/* Due date */}
        {task.dueDate && (
          <p className="text-[10px] text-gray-400 mt-2 pl-5">
            Due {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>
    </div>
  );
}
