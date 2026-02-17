import { http, HttpResponse } from 'msw';
import type { TodoTask } from '../../types';

const now = '2026-02-15T10:00:00.000Z';

export const mockTasks: TodoTask[] = [
  {
    id: 1,
    title: 'Build frontend',
    description: 'React + TypeScript app',
    isCompleted: false,
    priority: 'High',
    dueDate: '2026-03-01T00:00:00.000Z',
    parentId: null,
    createdAt: now,
    updatedAt: now,
    sortOrder: 0,
    children: [
      {
        id: 3,
        title: 'Create components',
        description: null,
        isCompleted: false,
        priority: 'Medium',
        dueDate: null,
        parentId: 1,
        createdAt: now,
        updatedAt: now,
        sortOrder: 0,
        children: [],
      },
      {
        id: 4,
        title: 'Write tests',
        description: 'Unit and integration tests',
        isCompleted: true,
        priority: 'High',
        dueDate: '2026-02-20T00:00:00.000Z',
        parentId: 1,
        createdAt: now,
        updatedAt: now,
        sortOrder: 1,
        children: [],
      },
    ],
  },
  {
    id: 2,
    title: 'Build backend',
    description: '.NET 8 API',
    isCompleted: false,
    priority: 'High',
    dueDate: null,
    parentId: null,
    createdAt: now,
    updatedAt: now,
    sortOrder: 1,
    children: [],
  },
  {
    id: 5,
    title: 'Low priority task',
    description: null,
    isCompleted: false,
    priority: 'Low',
    dueDate: null,
    parentId: null,
    createdAt: now,
    updatedAt: now,
    sortOrder: 2,
    children: [],
  },
];

let nextId = 100;

export const handlers = [
  http.get('/api/tasks', () => {
    return HttpResponse.json({
      success: true,
      data: mockTasks,
      errors: [],
    });
  }),

  http.get('/api/tasks/:id', ({ params }) => {
    const id = Number(params.id);
    function findTask(tasks: TodoTask[]): TodoTask | undefined {
      for (const t of tasks) {
        if (t.id === id) return t;
        const found = findTask(t.children);
        if (found) return found;
      }
      return undefined;
    }
    const task = findTask(mockTasks);
    if (!task) {
      return HttpResponse.json(
        { success: false, data: null, errors: ['Task not found'] },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true, data: task, errors: [] });
  }),

  http.post('/api/tasks', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const task: TodoTask = {
      id: nextId++,
      title: body.title as string,
      description: (body.description as string) ?? null,
      isCompleted: false,
      priority: (body.priority as TodoTask['priority']) ?? 'Medium',
      dueDate: (body.dueDate as string) ?? null,
      parentId: (body.parentId as number) ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sortOrder: (body.sortOrder as number) ?? 0,
      children: [],
    };
    return HttpResponse.json(
      { success: true, data: task, errors: [] },
      { status: 201 }
    );
  }),

  http.put('/api/tasks/:id', async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const task: TodoTask = {
      id: Number(params.id),
      title: body.title as string,
      description: (body.description as string) ?? null,
      isCompleted: false,
      priority: (body.priority as TodoTask['priority']) ?? 'Medium',
      dueDate: (body.dueDate as string) ?? null,
      parentId: null,
      createdAt: now,
      updatedAt: new Date().toISOString(),
      sortOrder: (body.sortOrder as number) ?? 0,
      children: [],
    };
    return HttpResponse.json({ success: true, data: task, errors: [] });
  }),

  http.delete('/api/tasks/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('/api/tasks/:id/toggle', ({ params }) => {
    const id = Number(params.id);
    const task: TodoTask = {
      id,
      title: 'Toggled Task',
      description: null,
      isCompleted: true,
      priority: 'Medium',
      dueDate: null,
      parentId: null,
      createdAt: now,
      updatedAt: new Date().toISOString(),
      sortOrder: 0,
      children: [],
    };
    return HttpResponse.json({ success: true, data: task, errors: [] });
  }),
];
