# TreeTodo

A to-do task management app with tree-structured tasks (parent/child nesting). .NET 8 backend API + React/TypeScript frontend.

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/architecture.md](docs/architecture.md) | Project structure, layer dependencies, data model, API contract, tech stack, trade-offs |
| [docs/testing-strategy.md](docs/testing-strategy.md) | Testing frameworks, patterns, coverage targets, conventions |
| [docs/agent-coordination.md](docs/agent-coordination.md) | Agent roles, shared API contract (DTO shapes), build order, ports |

**Read these docs before writing any code.** The architecture doc is the source of truth for API endpoints and data model.

## Skills (in `skills/`)

| Skill | When to use |
|-------|-------------|
| `skills/scaffold-backend.md` | What exists + what to implement in backend |
| `skills/scaffold-frontend.md` | What exists + what to implement in frontend |
| `skills/test-backend.md` | Running and fixing .NET tests |
| `skills/test-frontend.md` | Running and fixing React tests |
| `skills/api-check.md` | Smoke-testing all API endpoints with curl |
| `skills/verify-all.md` | Full build + test pass across both projects |

## Multi-Agent Setup

Two agents work in parallel via git worktrees:

### Backend Agent
- **Owns:** `src/backend/` directory only
- **Stack:** .NET 8, EF Core 8, SQLite, xUnit + FluentAssertions
- **Start with:** `skills/scaffold-backend.md`
- **Test with:** `skills/test-backend.md`
- Must not touch `src/frontend/`

### Frontend Agent
- **Owns:** `src/frontend/` directory only
- **Stack:** React 19, TypeScript, Vite 7, Vitest 4 + Testing Library + MSW 2
- **Start with:** `skills/scaffold-frontend.md`
- **Test with:** `skills/test-frontend.md`
- Must not touch `src/backend/`

**Shared contract** lives in `docs/agent-coordination.md` — both agents must match the DTO shapes and endpoint paths defined there.

## Quick Commands

```bash
# Backend
cd src/backend && dotnet build && dotnet test
cd src/backend/TreeTodo.Api && dotnet run        # http://localhost:5175

# Frontend
cd src/frontend && npm install && npm run build && npm run test:run
cd src/frontend && npm run dev                   # http://localhost:5173

# Full verify
cd src/backend && dotnet test && cd ../../src/frontend && npm run test:run
```

## Coding Conventions

### Backend (.NET)
- Async/await everywhere — no `.Result` or `.Wait()`
- Entity name: `TodoTask` (not `Task`, avoids System.Threading collision)
- Repository pattern: `ITaskRepository` in Core, implementation in Data
- DTOs are `record` types
- Validation via Data Annotations on request DTOs
- Nullable reference types enabled

### Frontend (React/TS)
- Functional components only, named exports
- Props interfaces: `{ComponentName}Props`
- API calls in `services/` only — components never call `fetch`
- Co-locate tests: `Component.test.tsx` next to `Component.tsx`
- No external state library — hooks + context for MVP
- Use `import type` for type-only imports (`verbatimModuleSyntax` enabled)

### Both
- Write tests alongside code, not after
- Tests must pass before marking any task complete
- Descriptive test names: `MethodName_Scenario_ExpectedResult`

## MVP Features (must build)

- CRUD for tasks with tree hierarchy
- Priority (Low/Medium/High) and optional due dates
- Toggle task completion
- Input validation (frontend + backend)
- Error handling with user-friendly messages
- Responsive layout
- Loading states in UI

## Future Enhancements (document in README only)

Auth, drag-and-drop, search/filter UI, tags, notifications, bulk ops, dark mode, export, SignalR real-time sync.
