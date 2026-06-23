import { useEffect, useState, useCallback, useRef } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { getTasks, updateTask, type TaskView } from '../services/taskService';
import { startConnection, onTaskAssigned, offTaskAssigned, stopConnection } from '../services/signalrService';
import { useAuth } from '../context/AuthContext';
import type { Task, TaskStatus } from '../types';
import KanbanColumn from '../components/KanbanColumn';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import CreateTaskModal from '../components/CreateTaskModal';

const STATUSES: TaskStatus[] = ['Todo', 'InProgress', 'Done'];

export default function Dashboard() {
  const { token } = useAuth();

  const [view, setView]             = useState<TaskView>('created');
  const [tasks, setTasks]           = useState<Task[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [selectedTask, setSelected] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [draggingTask, setDragging] = useState<Task | null>(null);

  const viewRef      = useRef(view);
  const loadTasksRef = useRef<() => void>(() => undefined);
  useEffect(() => { viewRef.current = view; }, [view]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getTasks(viewRef.current);
      setTasks(data);
    } catch {
      setError('Could not load tasks. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasksRef.current = () => void loadTasks(); }, [loadTasks]);
  useEffect(() => { void loadTasks(); }, [loadTasks, view]);

  // SignalR — auto-refresh on "assigned" tab
  useEffect(() => {
    if (!token) return;
    startConnection(token).catch(console.error);
    onTaskAssigned(() => {
      if (viewRef.current === 'assigned') loadTasksRef.current();
    });
    return () => { offTaskAssigned(); void stopConnection(); };
  }, [token]);

  // --- dnd-kit ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    const task = tasks.find((t) => t.id === active.id);
    if (task) setDragging(task);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setDragging(null);
    if (!over) return;

    const taskId    = String(active.id);
    const newStatus = String(over.id) as TaskStatus;

    // over.id must be one of our column statuses
    if (!STATUSES.includes(newStatus)) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await updateTask(taskId, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: newStatus,
        dueDate: task.dueDate,
        assignedToUserId: task.assignedToUserId,
      });
    } catch {
      void loadTasks(); // revert on failure
    }
  };

  const byStatus = (s: TaskStatus) => tasks.filter((t) => t.status === s);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          {(['created', 'assigned'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === v ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v === 'created' ? 'Created by Me' : 'Assigned to Me'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="sm:ml-auto flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          New Task
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-6">
        {loading && (
          <div className="flex items-center justify-center h-48">
            <svg className="animate-spin w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={() => void loadTasks()} className="text-sm text-indigo-600 hover:underline">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {STATUSES.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={byStatus(status)}
                  showCreator={view === 'assigned'}
                  onTaskClick={(task) => setSelected(task)}
                />
              ))}
            </div>

            {/* Floating drag preview */}
            <DragOverlay>
              {draggingTask && (
                <div className="rotate-2 scale-105">
                  <TaskCard task={draggingTask} onClick={() => undefined} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelected(null)}
          onRefresh={() => { setSelected(null); void loadTasks(); }}
        />
      )}

      <CreateTaskModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => void loadTasks()}
      />
    </div>
  );
}
