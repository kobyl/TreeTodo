# Skill: Scaffold Backend

Scaffold the .NET 8 backend solution structure from scratch.

## Steps

1. Create the solution and projects:
   ```
   backend/TreeTodo.sln
   backend/TreeTodo.Api/       (webapi)
   backend/TreeTodo.Core/      (classlib)
   backend/TreeTodo.Data/      (classlib)
   backend/TreeTodo.Tests/     (xunit)
   ```

2. Add project references following clean architecture:
   - Api → Core, Data
   - Data → Core
   - Tests → Api, Core, Data

3. Install NuGet packages:
   - **Api**: `Microsoft.EntityFrameworkCore.Design`
   - **Core**: (none — pure domain)
   - **Data**: `Microsoft.EntityFrameworkCore.Sqlite`
   - **Tests**: `Microsoft.AspNetCore.Mvc.Testing`, `Microsoft.EntityFrameworkCore.InMemory`, `FluentAssertions`

4. Create the `TodoTask` entity in Core/Models/ per `docs/architecture.md`
5. Create the `Priority` enum in Core/Enums/
6. Create `ITaskRepository` interface in Core/Interfaces/
7. Create `AppDbContext` in Data/ with `DbSet<TodoTask>` and cascade delete config
8. Create `TaskRepository` implementing `ITaskRepository` in Data/Repositories/
9. Create DTOs in Core/DTOs/: `TaskResponse`, `CreateTaskRequest`, `UpdateTaskRequest`
10. Create `TasksController` in Api/Controllers/ with all endpoints from `docs/architecture.md`
11. Configure DI, SQLite connection, and CORS in `Program.cs`
12. Create initial EF migration
13. Write tests for repository and controller

## Validation
- `dotnet build` succeeds with zero warnings
- `dotnet test` passes
- API responds on http://localhost:5175/api/tasks
