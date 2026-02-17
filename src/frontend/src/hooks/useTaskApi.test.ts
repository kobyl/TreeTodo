import { renderHook, act, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from '../test/mocks/handlers';
import { useTaskApi } from './useTaskApi';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useTaskApi', () => {
  it('fetchTasks_OnMount_LoadsTasks', async () => {
    const { result } = renderHook(() => useTaskApi());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tasks).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it('createTask_ValidRequest_ReturnsTask', async () => {
    const { result } = renderHook(() => useTaskApi());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let created: unknown;
    await act(async () => {
      created = await result.current.createTask({ title: 'Test' });
    });

    expect(created).toBeTruthy();
  });

  it('deleteTask_ExistingId_ReturnsTrue', async () => {
    const { result } = renderHook(() => useTaskApi());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let deleted: boolean | undefined;
    await act(async () => {
      deleted = await result.current.deleteTask(1);
    });

    expect(deleted).toBe(true);
  });

  it('toggleTask_ExistingId_ReturnsToggledTask', async () => {
    const { result } = renderHook(() => useTaskApi());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let toggled: unknown;
    await act(async () => {
      toggled = await result.current.toggleTask(1);
    });

    expect(toggled).toBeTruthy();
  });
});
