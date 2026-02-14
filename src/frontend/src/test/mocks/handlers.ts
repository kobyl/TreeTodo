import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/tasks', () => {
    return HttpResponse.json({
      success: true,
      data: [],
      errors: [],
    });
  }),

  http.get('/api/tasks/:id', () => {
    return HttpResponse.json({
      success: true,
      data: null,
      errors: [],
    });
  }),

  http.post('/api/tasks', () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          id: 1,
          title: 'New Task',
          description: null,
          isCompleted: false,
          priority: 'Medium',
          dueDate: null,
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sortOrder: 0,
          children: [],
        },
        errors: [],
      },
      { status: 201 }
    );
  }),

  http.put('/api/tasks/:id', () => {
    return HttpResponse.json({
      success: true,
      data: null,
      errors: [],
    });
  }),

  http.delete('/api/tasks/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('/api/tasks/:id/toggle', () => {
    return HttpResponse.json({
      success: true,
      data: null,
      errors: [],
    });
  }),
];
