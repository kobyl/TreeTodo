# TreeTodo

A task management application with tree-structured hierarchy (parent/child nesting). Built with a .NET 8 backend API and a React/TypeScript frontend.

## Features (MVP)

- CRUD operations for tasks with unlimited tree nesting
- Priority levels: Low, Medium, High
- Optional due dates
- Toggle task completion
- Input validation (frontend + backend)
- Error handling with user-friendly messages
- Responsive layout

## Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| API       | ASP.NET Core (.NET 8)    |
| ORM       | Entity Framework Core 8  |
| Database  | SQLite                   |
| Frontend  | React 19 + TypeScript    |
| Bundler   | Vite 7                   |
| Tests BE  | xUnit + FluentAssertions |
| Tests FE  | Vitest + Testing Library |

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/) (v24 recommended)
- npm 10+

## Getting Started

### Backend

```bash
cd src/backend
dotnet restore
dotnet build
dotnet run --project TreeTodo.Api
```

The API will be available at `http://localhost:5175`.

### Frontend

```bash
cd src/frontend
npm install
npm run dev
```

The frontend dev server will be available at `http://localhost:5173`, with API requests proxied to the backend.

### Running Tests

```bash
# Backend tests
cd src/backend && dotnet test

# Frontend tests
cd src/frontend && npm run test:run

# Frontend tests (watch mode)
cd src/frontend && npm test
```

## Project Structure

```
TreeTodo/
├── src/
│   ├── backend/          # .NET 8 solution (Api, Core, Data, Tests)
│   └── frontend/         # React + TypeScript + Vite app
├── docs/                 # Architecture and coordination docs
├── skills/               # Claude Code skill files
├── CLAUDE.md             # Agent entry point
└── README.md             # This file
```

See [docs/architecture.md](docs/architecture.md) for the full architecture breakdown.

## API Endpoints

| Method | Path                   | Description                         |
|--------|------------------------|-------------------------------------|
| GET    | /api/tasks             | All root tasks with nested children |
| GET    | /api/tasks/{id}        | Single task with subtree            |
| POST   | /api/tasks             | Create task (parentId optional)     |
| PUT    | /api/tasks/{id}        | Full update                         |
| DELETE | /api/tasks/{id}        | Delete task + descendants           |
| PATCH  | /api/tasks/{id}/toggle | Toggle completion status            |

## Assumptions

- **Single-user** — No authentication or multi-tenancy. The app is designed for one user managing their own tasks.
- **Moderate data volumes** — The tree is loaded eagerly (all tasks at once). This works well for hundreds of tasks but would need pagination/lazy-loading for thousands.
- **SQLite** — Chosen for zero-config and file-based portability. The EF Core abstraction makes switching to PostgreSQL/SQL Server a one-line change.
- **Hard delete** — Deleting a parent cascades to all children. No soft-delete or undo.

## Scalability Considerations

- **Database**: SQLite handles single-user workloads well. For multi-user production, swap to PostgreSQL via EF Core provider.
- **Tree loading**: Current eager-load approach is O(n) for all tasks. For large datasets, implement lazy-loading (fetch children on expand) or materialized path for efficient subtree queries.
- **Caching**: No caching layer currently. Add Redis or in-memory caching for read-heavy workloads.
- **Real-time**: No live updates. Add SignalR for multi-user collaborative task management.

