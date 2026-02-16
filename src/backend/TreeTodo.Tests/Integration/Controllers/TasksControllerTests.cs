using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TreeTodo.Core.DTOs;
using TreeTodo.Core.Enums;
using TreeTodo.Data;

namespace TreeTodo.Tests.Integration.Controllers;

public class TasksControllerTests
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() }
    };

    private static HttpClient CreateClient()
    {
        var dbName = Guid.NewGuid().ToString();
        var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Remove all DbContext-related registrations
                    var descriptors = services
                        .Where(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>)
                                 || d.ServiceType == typeof(DbContextOptions)
                                 || d.ServiceType == typeof(AppDbContext))
                        .ToList();
                    foreach (var d in descriptors) services.Remove(d);

                    services.AddDbContext<AppDbContext>(options =>
                        options.UseInMemoryDatabase(dbName));
                });
            });
        return factory.CreateClient();
    }

    private static async Task<ApiResponse<T>?> ReadResponse<T>(HttpResponseMessage response)
    {
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ApiResponse<T>>(content, JsonOptions);
    }

    // === GET /api/tasks ===

    [Fact]
    public async Task GetAll_EmptyDatabase_ReturnsEmptyList()
    {
        var client = CreateClient();

        var response = await client.GetAsync("/api/tasks");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await ReadResponse<List<TaskResponse>>(response);
        body!.Success.Should().BeTrue();
        body.Data.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAll_WithTasks_ReturnsWrappedInApiResponse()
    {
        var client = CreateClient();
        await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("Task 1"));

        var response = await client.GetAsync("/api/tasks");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await ReadResponse<List<TaskResponse>>(response);
        body!.Success.Should().BeTrue();
        body.Data.Should().HaveCount(1);
        body.Data![0].Title.Should().Be("Task 1");
    }

    [Fact]
    public async Task GetAll_WithChildren_ReturnsNestedTree()
    {
        var client = CreateClient();
        var parentResponse = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("Parent"));
        var parentBody = await ReadResponse<TaskResponse>(parentResponse);
        var parentId = parentBody!.Data!.Id;

        await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("Child", ParentId: parentId));

        var response = await client.GetAsync("/api/tasks");

        var body = await ReadResponse<List<TaskResponse>>(response);
        body!.Data.Should().HaveCount(1);
        body.Data![0].Children.Should().HaveCount(1);
        body.Data[0].Children[0].Title.Should().Be("Child");
    }

    [Fact]
    public async Task GetAll_ExcludeCompleted_FiltersCorrectly()
    {
        var client = CreateClient();
        var createResponse = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("Task 1"));
        var createBody = await ReadResponse<TaskResponse>(createResponse);
        await client.PatchAsync($"/api/tasks/{createBody!.Data!.Id}/toggle", null);
        await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("Task 2"));

        var response = await client.GetAsync("/api/tasks?includeCompleted=false");

        var body = await ReadResponse<List<TaskResponse>>(response);
        body!.Data.Should().HaveCount(1);
        body.Data![0].Title.Should().Be("Task 2");
    }

    [Fact]
    public async Task GetAll_FilterByPriority_ReturnsMatchingOnly()
    {
        var client = CreateClient();
        await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("High", Priority: Priority.High));
        await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("Low", Priority: Priority.Low));

        var response = await client.GetAsync("/api/tasks?priority=High");

        var body = await ReadResponse<List<TaskResponse>>(response);
        body!.Data.Should().HaveCount(1);
        body.Data![0].Title.Should().Be("High");
    }

    // === GET /api/tasks/{id} ===

    [Fact]
    public async Task GetById_ExistingTask_Returns200WithTask()
    {
        var client = CreateClient();
        var createResponse = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("Test Task"));
        var createBody = await ReadResponse<TaskResponse>(createResponse);

        var response = await client.GetAsync($"/api/tasks/{createBody!.Data!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await ReadResponse<TaskResponse>(response);
        body!.Data!.Title.Should().Be("Test Task");
    }

    [Fact]
    public async Task GetById_NonExistent_Returns404()
    {
        var client = CreateClient();

        var response = await client.GetAsync("/api/tasks/999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // === POST /api/tasks ===

    [Fact]
    public async Task Post_ValidTask_Returns201WithLocationHeader()
    {
        var client = CreateClient();

        var response = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("New Task"));

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
        var body = await ReadResponse<TaskResponse>(response);
        body!.Success.Should().BeTrue();
        body.Data!.Title.Should().Be("New Task");
        body.Data.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task Post_MissingTitle_Returns400()
    {
        var client = CreateClient();

        var response = await client.PostAsJsonAsync("/api/tasks", new { Title = (string?)null });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Post_InvalidParentId_Returns400()
    {
        var client = CreateClient();

        var response = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("Child", ParentId: 999));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await ReadResponse<TaskResponse>(response);
        body!.Errors.Should().Contain("Parent task not found");
    }

    [Fact]
    public async Task Post_WithValidParentId_CreatesChildTask()
    {
        var client = CreateClient();
        var parentResponse = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("Parent"));
        var parentBody = await ReadResponse<TaskResponse>(parentResponse);

        var response = await client.PostAsJsonAsync("/api/tasks",
            new CreateTaskRequest("Child", ParentId: parentBody!.Data!.Id));

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await ReadResponse<TaskResponse>(response);
        body!.Data!.ParentId.Should().Be(parentBody.Data.Id);
    }

    [Fact]
    public async Task Post_TitleExceedsMaxLength_Returns400()
    {
        var client = CreateClient();
        var longTitle = new string('x', 201);

        var response = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest(longTitle));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // === PUT /api/tasks/{id} ===

    [Fact]
    public async Task Put_ValidUpdate_Returns200WithUpdatedTask()
    {
        var client = CreateClient();
        var createResponse = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("Original"));
        var createBody = await ReadResponse<TaskResponse>(createResponse);

        var response = await client.PutAsJsonAsync(
            $"/api/tasks/{createBody!.Data!.Id}",
            new UpdateTaskRequest("Updated", Priority: Priority.High));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await ReadResponse<TaskResponse>(response);
        body!.Data!.Title.Should().Be("Updated");
        body.Data.Priority.Should().Be(Priority.High);
    }

    [Fact]
    public async Task Put_NonExistent_Returns404()
    {
        var client = CreateClient();

        var response = await client.PutAsJsonAsync("/api/tasks/999", new UpdateTaskRequest("Test"));

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Put_MissingTitle_Returns400()
    {
        var client = CreateClient();
        var createResponse = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("Test"));
        var createBody = await ReadResponse<TaskResponse>(createResponse);

        var response = await client.PutAsJsonAsync(
            $"/api/tasks/{createBody!.Data!.Id}",
            new { Title = (string?)null });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // === PATCH /api/tasks/{id}/toggle ===

    [Fact]
    public async Task Toggle_ExistingTask_FlipsIsCompleted()
    {
        var client = CreateClient();
        var createResponse = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("Test"));
        var createBody = await ReadResponse<TaskResponse>(createResponse);
        createBody!.Data!.IsCompleted.Should().BeFalse();

        var response = await client.PatchAsync($"/api/tasks/{createBody.Data.Id}/toggle", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await ReadResponse<TaskResponse>(response);
        body!.Data!.IsCompleted.Should().BeTrue();
    }

    [Fact]
    public async Task Toggle_NonExistent_Returns404()
    {
        var client = CreateClient();

        var response = await client.PatchAsync("/api/tasks/999/toggle", null);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // === DELETE /api/tasks/{id} ===

    [Fact]
    public async Task Delete_ExistingTask_Returns204()
    {
        var client = CreateClient();
        var createResponse = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("To Delete"));
        var createBody = await ReadResponse<TaskResponse>(createResponse);

        var response = await client.DeleteAsync($"/api/tasks/{createBody!.Data!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var getResponse = await client.GetAsync($"/api/tasks/{createBody.Data.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Delete_NonExistent_Returns404()
    {
        var client = CreateClient();

        var response = await client.DeleteAsync("/api/tasks/999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
