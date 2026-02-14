export interface TodoTask {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string | null;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  children: TodoTask[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  errors: string[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  parentId?: number;
  sortOrder?: number;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  sortOrder?: number;
}
