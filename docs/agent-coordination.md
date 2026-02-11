# Multi-Agent Coordination

## Agent Roles

### Backend Agent
- Owns: `backend/` directory
- Responsibilities: .NET solution, API controllers, EF Core data layer, backend tests
- Should NOT touch: `frontend/` directory

### Frontend Agent
- Owns: `frontend/` directory
- Responsibilities: React app, components, hooks, services, frontend tests
- Should NOT touch: `backend/` directory

## Shared Contract

Both agents must agree on the API contract defined in `docs/architecture.md`:
- Endpoint paths and methods
- Request/response shapes
- The response envelope format (`{ success, data, errors }`)
- The `TodoTask` DTO shape returned by the API

### TypeScript DTO (frontend must match this)
```typescript
interface TodoTask {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string | null;       // ISO 8601
  parentId: number | null;
  createdAt: string;            // ISO 8601
  updatedAt: string;            // ISO 8601
  sortOrder: number;
  children: TodoTask[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  errors: string[];
}

interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  parentId?: number;
  sortOrder?: number;
}

interface UpdateTaskRequest {
  title: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  sortOrder?: number;
}
```

## Build Order

1. **Backend first** — API must exist before frontend can integrate
2. **Frontend can start with MSW mocks** — doesn't need live API to begin component work
3. **Integration** — point frontend at live backend, verify end-to-end

## Port Assignments

| Service  | Port  |
|----------|-------|
| Backend  | 5175  |
| Frontend | 5173  |

Frontend Vite dev server proxies `/api/*` to `http://localhost:5175`.
