# Architecture

## Project Structure

```
TreeTodo/
├── src/
│   ├── backend/                      # .NET 8 solution
│   │   ├── TreeTodo.sln
│   │   ├── TreeTodo.Api/             # ASP.NET Core host
│   │   │   ├── Controllers/          # REST controllers
│   │   │   ├── Middleware/           # Error handling, logging
│   │   │   ├── Program.cs           # App entry point, DI registration
│   │   │   └── appsettings.json
│   │   ├── TreeTodo.Core/            # Domain layer (no infra deps)
│   │   │   ├── Models/              # Entity classes
│   │   │   ├── DTOs/                # Request/response records
│   │   │   ├── Interfaces/          # ITaskRepository, ITaskService
│   │   │   └── Enums/               # Priority, etc.
│   │   ├── TreeTodo.Data/            # Data access layer
│   │   │   ├── AppDbContext.cs
│   │   │   ├── Repositories/        # EF Core implementations
│   │   │   └── Migrations/
│   │   └── TreeTodo.Tests/           # Test project
│   │       ├── Unit/                # Repository + service tests
│   │       └── Integration/         # Controller/API tests
│   └── frontend/                     # React app (Vite)
│       ├── src/
│       │   ├── components/          # UI components
│       │   │   ├── TaskTree/        # Tree rendering
│       │   │   ├── TaskForm/        # Create/edit form
│       │   │   └── common/          # Buttons, modals, spinners
│       │   ├── hooks/               # useTaskApi, useTreeState
│       │   ├── services/            # api.ts (fetch wrapper)
│       │   ├── types/               # TypeScript interfaces
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── src/test/                # Test setup and mocks
├── docs/                             # Project documentation
├── skills/                           # Claude Code skill files
├── CLAUDE.md                         # Agent entry point
└── README.md                         # Human-facing setup guide
```

## Layer Dependencies

```
┌─────────────────┐
│  TreeTodo.Api   │  ← Controllers, DI, Middleware
│  (presentation) │
└────────┬────────┘
         │ depends on
         ▼
┌─────────────────┐
│  TreeTodo.Core  │  ← Models, DTOs, Interfaces
│    (domain)     │
└────────▲────────┘
         │ implements
┌────────┴────────┐
│  TreeTodo.Data  │  ← DbContext, Repositories
│ (infrastructure)│
└─────────────────┘
```

**Rule:** Core has ZERO references to Api or Data. Api references Core and Data. Data references only Core.

## Data Model

### TodoTask Entity

| Column      | Type       | Constraints                          |
|-------------|------------|--------------------------------------|
| Id          | int        | PK, auto-increment                   |
| Title       | string     | Required, max 200 chars              |
| Description | string?    | Optional, max 2000 chars             |
| IsCompleted | bool       | Default: false                       |
| Priority    | Priority   | Enum: Low=0, Medium=1, High=2       |
| DueDate     | DateTime?  | Optional, UTC                        |
| ParentId    | int?       | FK → TodoTask.Id, nullable           |
| CreatedAt   | DateTime   | UTC, set on insert                   |
| UpdatedAt   | DateTime   | UTC, set on every update             |
| SortOrder   | int        | Ordering among siblings, default 0   |

> Entity is named `TodoTask` (not `Task`) to avoid collision with `System.Threading.Tasks.Task`.

### Tree Rules

- `ParentId = null` → root task
- Children reference parent via `ParentId`
- Completing a parent does NOT auto-complete children
- Deleting a parent **cascades** to all descendants
- Max recommended depth: 5 levels (UI constraint, not DB-enforced)

## API Contract

### Endpoints

| Method | Path                      | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | /api/tasks                | All root tasks with nested children|
| GET    | /api/tasks/{id}           | Single task with subtree           |
| POST   | /api/tasks                | Create task (ParentId optional)    |
| PUT    | /api/tasks/{id}           | Full update                        |
| DELETE | /api/tasks/{id}           | Delete task + descendants          |
| PATCH  | /api/tasks/{id}/toggle    | Toggle IsCompleted                 |

### Query Parameters (GET /api/tasks)

| Param             | Type   | Default | Description              |
|-------------------|--------|---------|--------------------------|
| includeCompleted  | bool   | true    | Include completed tasks  |
| priority          | string | null    | Filter by priority level |

### Response Envelope

```json
{
  "success": true,
  "data": { ... },
  "errors": ["string"]
}
```

### Status Codes

| Code | Usage                                      |
|------|--------------------------------------------|
| 200  | Successful GET, PUT, PATCH                 |
| 201  | Successful POST (Location header set)      |
| 204  | Successful DELETE                          |
| 400  | Validation errors                          |
| 404  | Task not found                             |
| 500  | Unexpected server error                    |

## Tech Stack Summary

| Layer     | Technology               | Version  |
|-----------|--------------------------|----------|
| API       | ASP.NET Core             | .NET 8   |
| ORM       | Entity Framework Core    | 8.x      |
| Database  | SQLite                   | 3.x      |
| Frontend  | React + TypeScript       | 19.x     |
| Bundler   | Vite                     | 7.x      |
| Tests BE  | xUnit + FluentAssertions | latest   |
| Tests FE  | Vitest + Testing Library | 4.x      |

## Design Decisions & Trade-offs

| Decision | Rationale | Future Alternative |
|----------|-----------|-------------------|
| SQLite file DB | Zero-config, persists across restarts, single-file backup | PostgreSQL/SQL Server for production scale |
| Eager tree loading | Simple for MVP data volumes (hundreds of tasks) | Lazy-load children on expand for 10k+ tasks |
| No authentication | MVP is single-user demo | JWT + ASP.NET Identity |
| No real-time | Refresh-based updates sufficient for single user | SignalR for collaborative editing |
| Hard delete | Simpler; cascade handles children | Soft delete with IsDeleted flag |
| No state library | useState/useEffect sufficient for tree CRUD | Zustand or TanStack Query at scale |
| Repository pattern | Testable; swap DB provider without touching API | Could simplify to direct DbContext if never swapping |
