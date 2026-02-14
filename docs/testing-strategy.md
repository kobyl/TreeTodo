# Testing Strategy

## Overview

Both agents (frontend and backend) must write tests alongside implementation code. No PR should merge without passing tests.

## Backend: xUnit + FluentAssertions + EF Core In-Memory

### Framework Choice

| Library             | Purpose                                      |
|---------------------|----------------------------------------------|
| **xUnit**           | Test runner — .NET ecosystem standard, async-native |
| **FluentAssertions**| Readable assertions (`result.Should().BeEquivalentTo(...)`) |
| **Microsoft.EntityFrameworkCore.InMemory** | Fast in-memory DB for repository tests |
| **Microsoft.AspNetCore.Mvc.Testing** | Integration tests via `WebApplicationFactory` |

### Why xUnit over NUnit/MSTest
- First-class async support (no `[AsyncTest]` attribute needed)
- Constructor injection for test fixtures (no `[SetUp]` / `[TearDown]`)
- Parallel test execution by default
- Most widely used in modern .NET — largest community, best docs

### Test Categories

```
TreeTodo.Tests/
├── Unit/
│   ├── Repositories/
│   │   └── TaskRepositoryTests.cs      # CRUD against in-memory EF
│   ├── Services/
│   │   └── TaskServiceTests.cs         # Business logic (if service layer exists)
│   └── Models/
│       └── TodoTaskTests.cs            # Validation, tree logic
└── Integration/
    └── Controllers/
        └── TasksControllerTests.cs     # Full HTTP pipeline via WebApplicationFactory
```

### Patterns

**Unit tests (repository):**
```csharp
public class TaskRepositoryTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly TaskRepository _repo;

    public TaskRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);
        _repo = new TaskRepository(_context);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsOnlyRootTasks()
    {
        // Arrange, Act, Assert with FluentAssertions
    }

    public void Dispose() => _context.Dispose();
}
```

**Integration tests (API):**
```csharp
public class TasksControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public TasksControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Replace SQLite with in-memory for tests
            });
        }).CreateClient();
    }

    [Fact]
    public async Task Post_ValidTask_Returns201()
    {
        var response = await _client.PostAsJsonAsync("/api/tasks", new { Title = "Test" });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}
```

### Running Backend Tests
```bash
cd src/backend
dotnet test --verbosity normal
dotnet test --filter "Category=Unit"         # Unit only
dotnet test --filter "Category=Integration"  # Integration only
```

---

## Frontend: Vitest + React Testing Library

### Framework Choice

| Library                    | Purpose                                  |
|----------------------------|------------------------------------------|
| **Vitest**                 | Test runner — native Vite integration, fast HMR-aware |
| **@testing-library/react** | DOM testing — user-centric queries       |
| **@testing-library/jest-dom** | Custom matchers (`toBeInTheDocument()`) |
| **msw** (Mock Service Worker) | API mocking at network level          |

### Why Vitest over Jest
- **Native Vite integration** — shares config, transforms, aliases; zero extra setup
- **ESM-first** — no CJS/ESM interop headaches with modern React
- **Compatible API** — same `describe/it/expect` as Jest, easy migration
- **Faster** — uses Vite's transform pipeline, avoids Babel

### Why MSW for API mocking
- Intercepts at the network level (not patching `fetch`)
- Same mock handlers work in tests AND browser dev mode
- Tests real fetch calls, not implementation details

### Test Structure

```
src/frontend/
├── src/
│   ├── components/
│   │   ├── TaskTree/
│   │   │   ├── TaskTree.tsx
│   │   │   └── TaskTree.test.tsx       # Co-located test
│   │   └── TaskForm/
│   │       ├── TaskForm.tsx
│   │       └── TaskForm.test.tsx
│   ├── hooks/
│   │   ├── useTaskApi.ts
│   │   └── useTaskApi.test.ts
│   └── services/
│       ├── api.ts
│       └── api.test.ts
└── src/test/
    ├── setup.ts                         # Vitest global setup
    └── mocks/
        └── handlers.ts                  # MSW request handlers
```

### Patterns

**Component test:**
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from './TaskForm';

describe('TaskForm', () => {
  it('calls onSubmit with title when form is submitted', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Title'), 'New task');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: 'New task' }));
  });
});
```

**API service test with MSW:**
```tsx
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { taskApi } from './api';

const server = setupServer(
  http.get('/api/tasks', () => HttpResponse.json({ success: true, data: [], errors: [] }))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('taskApi', () => {
  it('fetches tasks', async () => {
    const result = await taskApi.getAll();
    expect(result.success).toBe(true);
  });
});
```

### Running Frontend Tests
```bash
cd src/frontend
npm test                    # Watch mode
npm run test:run            # Single run (CI)
npm run test:coverage       # With coverage report
```

---

## Test Coverage Expectations

| Area                  | Target | Notes                                |
|-----------------------|--------|--------------------------------------|
| Backend repositories  | 90%+   | Core data operations                 |
| Backend controllers   | 80%+   | Happy path + error cases             |
| Frontend services     | 90%+   | API layer must be reliable           |
| Frontend components   | 70%+   | Key interactions, not every CSS class|
| Frontend hooks        | 80%+   | State management logic               |

## Conventions for Both Agents

1. **Write tests alongside code** — not as a separate step after
2. **Name tests descriptively** — `MethodName_Scenario_ExpectedResult`
3. **One assertion per test** (soft rule) — prefer focused tests
4. **No testing implementation details** — test behavior, not internals
5. **Tests must pass before marking task complete**
