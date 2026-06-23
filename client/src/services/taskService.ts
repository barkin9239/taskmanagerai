import api from './api';
import type {
  Task,
  SubTask,
  TaskAnalysis,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskPriority,
  TaskStatus,
} from '../types';

export type TaskView = 'created' | 'assigned';

export const getTasks = (view: TaskView = 'created', status?: TaskStatus, priority?: TaskPriority) =>
  api.get<Task[]>('/api/tasks', { params: { view, status, priority } });

export const getTaskById = (id: string) =>
  api.get<Task>(`/api/tasks/${id}`);

export const createTask = (data: CreateTaskPayload) =>
  api.post<Task>('/api/tasks', data);

export const updateTask = (id: string, data: UpdateTaskPayload) =>
  api.put<Task>(`/api/tasks/${id}`, data);

export const deleteTask = (id: string) =>
  api.delete(`/api/tasks/${id}`);

export const addSubTask = (taskId: string, title: string) =>
  api.post<SubTask>(`/api/tasks/${taskId}/subtasks`, { title });

export const assignTask = (taskId: string, assignedToUserId: string) =>
  api.post<Task>(`/api/tasks/${taskId}/assign`, { assignedToUserId });

export const analyzeTask = (taskId: string, apply = false) =>
  api.post<TaskAnalysis>(`/api/tasks/${taskId}/analyze`, null, {
    params: { apply },
  });
