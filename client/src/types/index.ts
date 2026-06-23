export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Todo' | 'InProgress' | 'Done';

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
  expiresAt: string;
}

export interface UserInfo {
  userId: string;
  email: string;
  name: string;
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;      // task owner id
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string | null;
  assignedToUserId: string | null;
  assignedToUserName: string;
  createdByName: string;
  subTasks: SubTask[];
}

export interface CreateTaskPayload {
  title: string;
  assignedToUserId?: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskPayload {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  assignedToUserId?: string | null;
}

export interface TaskAnalysis {
  suggestedPriority: TaskPriority;
  suggestedSubTasks: string[];
  reasoning: string;
}

export interface TaskAssignedNotification {
  taskId: string;
  taskTitle: string;
  assignedByEmail: string;
  assignedAt: string;
}
