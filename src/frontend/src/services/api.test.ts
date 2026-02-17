import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { handlers } from '../test/mocks/handlers';
import { taskApi } from './api';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('taskApi', () => {
  describe('getAll', () => {
    it('getAll_DefaultParams_ReturnsTaskList', async () => {
      const result = await taskApi.getAll();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data[0].title).toBe('Build frontend');
    });

    it('getAll_ServerError_ReturnsErrorResponse', async () => {
      server.use(
        http.get('/api/tasks', () => {
          return HttpResponse.json(
            { success: false, data: null, errors: ['Server error'] },
            { status: 500 }
          );
        })
      );
      const result = await taskApi.getAll();
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Server error');
    });
  });

  describe('getById', () => {
    it('getById_ExistingId_ReturnsTask', async () => {
      const result = await taskApi.getById(1);
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Build frontend');
    });

    it('getById_NonExistentId_Returns404Error', async () => {
      const result = await taskApi.getById(999);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Task not found');
    });
  });

  describe('create', () => {
    it('create_ValidRequest_ReturnsCreatedTask', async () => {
      const result = await taskApi.create({ title: 'New task', priority: 'High' });
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('New task');
      expect(result.data.priority).toBe('High');
    });
  });

  describe('update', () => {
    it('update_ValidRequest_ReturnsUpdatedTask', async () => {
      const result = await taskApi.update(1, { title: 'Updated task' });
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Updated task');
    });
  });

  describe('delete', () => {
    it('delete_ExistingId_ReturnsSuccess', async () => {
      const result = await taskApi.delete(1);
      expect(result.success).toBe(true);
    });
  });

  describe('toggle', () => {
    it('toggle_ExistingId_ReturnsToggledTask', async () => {
      const result = await taskApi.toggle(1);
      expect(result.success).toBe(true);
      expect(result.data.isCompleted).toBe(true);
    });
  });
});
