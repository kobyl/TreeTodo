# Skill: Scaffold Backend

The baseline .NET 8 solution is already scaffolded in `src/backend/`. This skill documents what exists and what the backend agent needs to implement.

## Already Done (baseline)

- Solution with 4 projects: Api, Core, Data, Tests
- Project references wired (clean architecture)
- NuGet packages installed (EF Core SQLite, FluentAssertions, Mvc.Testing, InMemory)
- `TodoTask` entity in Core/Models/
- `Priority` enum in Core/Enums/
- DTOs in Core/DTOs/: `TaskResponse`, `CreateTaskRequest`, `UpdateTaskRequest`, `ApiResponse<T>`
- `ITaskRepository` interface in Core/Interfaces/
- `AppDbContext` in Data/ with entity configuration
- `Program.cs` with DI, CORS, SQLite, JSON enum converter

## What to Implement

1. Create `TaskRepository` implementing `ITaskRepository` in Data/Repositories/
2. Register `ITaskRepository` in DI (`Program.cs`)
3. Create `TasksController` in Api/Controllers/ with all endpoints from `docs/architecture.md`
4. Create initial EF migration
5. Write unit tests for repository (in Tests/Unit/Repositories/)
6. Write integration tests for controller (in Tests/Integration/Controllers/)

## Validation
- `dotnet build` succeeds with zero warnings
- `dotnet test` passes
- API responds on http://localhost:5175/api/tasks
