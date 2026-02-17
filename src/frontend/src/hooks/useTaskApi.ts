import { useState, useCallback, useEffect } from 'react';
import type { TodoTask, CreateTaskRequest, UpdateTaskRequest } from '../types';
import { taskApi } from '../services/api';

export interface UseTaskApiReturn {
  tasks: TodoTask[];
  loading: boolean;
  error: string | null;
  fetchTasks: (includeCompleted?: boolean, priority?: string) => Promise<void>;
  createTask: (request: CreateTaskRequest) => Promise<TodoTask | null>;
  updateTask: (id: number, request: UpdateTaskRequest) => Promise<TodoTask | null>;
  deleteTask: (id: number) => Promise<boolean>;
  toggleTask: (id: number) => Promise<TodoTask | null>;
}

export function useTaskApi(): UseTaskApiReturn {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (includeCompleted = true, priority?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskApi.getAll(includeCompleted, priority);
      if (response.success) {
        setTasks(response.data);
      } else {
        setError(response.errors[0] ?? 'Failed to fetch tasks');
      }
    } catch {
      setError('Network error: failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (request: CreateTaskRequest): Promise<TodoTask | null> => {
    setError(null);
    try {
      const response = await taskApi.create(request);
      if (response.success) {
        await fetchTasks();
        return response.data;
      } else {
        setError(response.errors[0] ?? 'Failed to create task');
        return null;
      }
    } catch {
      setError('Network error: failed to create task');
      return null;
    }
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: number, request: UpdateTaskRequest): Promise<TodoTask | null> => {
    setError(null);
    try {
      const response = await taskApi.update(id, request);
      if (response.success) {
        await fetchTasks();
        return response.data;
      } else {
        setError(response.errors[0] ?? 'Failed to update task');
        return null;
      }
    } catch {
      setError('Network error: failed to update task');
      return null;
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: number): Promise<boolean> => {
    setError(null);
    try {
      const response = await taskApi.delete(id);
      if (response.success) {
        await fetchTasks();
        return true;
      } else {
        setError(response.errors[0] ?? 'Failed to delete task');
        return false;
      }
    } catch {
      setError('Network error: failed to delete task');
      return false;
    }
  }, [fetchTasks]);

  const toggleTask = useCallback(async (id: number): Promise<TodoTask | null> => {
    setError(null);
    try {
      const response = await taskApi.toggle(id);
      if (response.success) {
        await fetchTasks();
        return response.data;
      } else {
        setError(response.errors[0] ?? 'Failed to toggle task');
        return null;
      }
    } catch {
      setError('Network error: failed to toggle task');
      return null;
    }
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask, toggleTask };
}
