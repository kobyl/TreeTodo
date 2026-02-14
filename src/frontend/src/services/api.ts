import type { TodoTask, ApiResponse, CreateTaskRequest, UpdateTaskRequest } from '../types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const body = await response.json().catch(() => null) as ApiResponse<T> | null;
    return {
      success: false,
      data: null as T,
      errors: body?.errors ?? [`Request failed with status ${response.status}`],
    };
  }

  if (response.status === 204) {
    return { success: true, data: null as T, errors: [] };
  }

  return response.json() as Promise<ApiResponse<T>>;
}

export const taskApi = {
  getAll: async (includeCompleted = true, priority?: string): Promise<ApiResponse<TodoTask[]>> => {
    const params = new URLSearchParams();
    params.set('includeCompleted', String(includeCompleted));
    if (priority) params.set('priority', priority);

    const response = await fetch(`${API_BASE}/tasks?${params}`);
    return handleResponse<TodoTask[]>(response);
  },

  getById: async (id: number): Promise<ApiResponse<TodoTask>> => {
    const response = await fetch(`${API_BASE}/tasks/${id}`);
    return handleResponse<TodoTask>(response);
  },

  create: async (request: CreateTaskRequest): Promise<ApiResponse<TodoTask>> => {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return handleResponse<TodoTask>(response);
  },

  update: async (id: number, request: UpdateTaskRequest): Promise<ApiResponse<TodoTask>> => {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return handleResponse<TodoTask>(response);
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<null>(response);
  },

  toggle: async (id: number): Promise<ApiResponse<TodoTask>> => {
    const response = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
    return handleResponse<TodoTask>(response);
  },
};
