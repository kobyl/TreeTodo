using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TreeTodo.Core.Enums;
using TreeTodo.Core.Models;
using TreeTodo.Data;
using TreeTodo.Data.Repositories;

namespace TreeTodo.Tests.Unit.Repositories;

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

    public void Dispose() => _context.Dispose();

    // === GetAllRootTasksAsync ===

    [Fact]
    public async Task GetAllRootTasksAsync_NoTasks_ReturnsEmptyList()
    {
        var result = await _repo.GetAllRootTasksAsync();

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllRootTasksAsync_WithRootAndChildTasks_ReturnsOnlyRoots()
    {
        var root = new TodoTask { Title = "Root" };
        _context.Tasks.Add(root);
        await _context.SaveChangesAsync();

        var child = new TodoTask { Title = "Child", ParentId = root.Id };
        _context.Tasks.Add(child);
        await _context.SaveChangesAsync();

        var result = await _repo.GetAllRootTasksAsync();

        result.Should().HaveCount(1);
        result[0].Title.Should().Be("Root");
    }

    [Fact]
    public async Task GetAllRootTasksAsync_WithChildren_IncludesNestedChildren()
    {
        var root = new TodoTask { Title = "Root" };
        _context.Tasks.Add(root);
        await _context.SaveChangesAsync();

        var child = new TodoTask { Title = "Child", ParentId = root.Id };
        _context.Tasks.Add(child);
        await _context.SaveChangesAsync();

        var result = await _repo.GetAllRootTasksAsync();

        result[0].Children.Should().HaveCount(1);
        result[0].Children[0].Title.Should().Be("Child");
    }

    [Fact]
    public async Task GetAllRootTasksAsync_ExcludeCompleted_FiltersCompletedTasks()
    {
        _context.Tasks.AddRange(
            new TodoTask { Title = "Active", IsCompleted = false },
            new TodoTask { Title = "Done", IsCompleted = true }
        );
        await _context.SaveChangesAsync();

        var result = await _repo.GetAllRootTasksAsync(includeCompleted: false);

        result.Should().HaveCount(1);
        result[0].Title.Should().Be("Active");
    }

    [Fact]
    public async Task GetAllRootTasksAsync_FilterByPriority_ReturnsMatchingOnly()
    {
        _context.Tasks.AddRange(
            new TodoTask { Title = "High", Priority = Priority.High },
            new TodoTask { Title = "Low", Priority = Priority.Low }
        );
        await _context.SaveChangesAsync();

        var result = await _repo.GetAllRootTasksAsync(priority: "High");

        result.Should().HaveCount(1);
        result[0].Title.Should().Be("High");
    }

    [Fact]
    public async Task GetAllRootTasksAsync_InvalidPriority_ReturnsAllTasks()
    {
        _context.Tasks.AddRange(
            new TodoTask { Title = "One" },
            new TodoTask { Title = "Two" }
        );
        await _context.SaveChangesAsync();

        var result = await _repo.GetAllRootTasksAsync(priority: "Invalid");

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAllRootTasksAsync_OrdersBySortOrderThenId()
    {
        _context.Tasks.AddRange(
            new TodoTask { Title = "Second", SortOrder = 2 },
            new TodoTask { Title = "First", SortOrder = 1 }
        );
        await _context.SaveChangesAsync();

        var result = await _repo.GetAllRootTasksAsync();

        result[0].Title.Should().Be("First");
        result[1].Title.Should().Be("Second");
    }

    // === GetByIdAsync ===

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsTask()
    {
        var task = new TodoTask { Title = "Test" };
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        var result = await _repo.GetByIdAsync(task.Id);

        result.Should().NotBeNull();
        result!.Title.Should().Be("Test");
    }

    [Fact]
    public async Task GetByIdAsync_NonExistentId_ReturnsNull()
    {
        var result = await _repo.GetByIdAsync(999);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_TaskWithChildren_ReturnsFullSubtree()
    {
        var root = new TodoTask { Title = "Root" };
        _context.Tasks.Add(root);
        await _context.SaveChangesAsync();

        var child = new TodoTask { Title = "Child", ParentId = root.Id };
        _context.Tasks.Add(child);
        await _context.SaveChangesAsync();

        var grandchild = new TodoTask { Title = "Grandchild", ParentId = child.Id };
        _context.Tasks.Add(grandchild);
        await _context.SaveChangesAsync();

        var result = await _repo.GetByIdAsync(root.Id);

        result.Should().NotBeNull();
        result!.Children.Should().HaveCount(1);
        result.Children[0].Children.Should().HaveCount(1);
        result.Children[0].Children[0].Title.Should().Be("Grandchild");
    }

    // === CreateAsync ===

    [Fact]
    public async Task CreateAsync_ValidTask_SetsIdAndTimestamps()
    {
        var task = new TodoTask { Title = "New Task" };

        var result = await _repo.CreateAsync(task);

        result.Id.Should().BeGreaterThan(0);
        result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
        result.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
    }

    [Fact]
    public async Task CreateAsync_WithParentId_CreatesChildTask()
    {
        var parent = new TodoTask { Title = "Parent" };
        _context.Tasks.Add(parent);
        await _context.SaveChangesAsync();

        var child = new TodoTask { Title = "Child", ParentId = parent.Id };
        var result = await _repo.CreateAsync(child);

        result.ParentId.Should().Be(parent.Id);
    }

    // === UpdateAsync ===

    [Fact]
    public async Task UpdateAsync_ExistingTask_UpdatesFieldsAndTimestamp()
    {
        var task = new TodoTask { Title = "Original" };
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        var originalUpdatedAt = task.UpdatedAt;
        await Task.Delay(10); // Ensure time difference

        task.Title = "Updated";
        var result = await _repo.UpdateAsync(task);

        result.Title.Should().Be("Updated");
        result.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    // === DeleteAsync ===

    [Fact]
    public async Task DeleteAsync_ExistingTask_RemovesFromDatabase()
    {
        var task = new TodoTask { Title = "To Delete" };
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        await _repo.DeleteAsync(task.Id);

        var exists = await _context.Tasks.AnyAsync(t => t.Id == task.Id);
        exists.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_NonExistentTask_DoesNotThrow()
    {
        var act = () => _repo.DeleteAsync(999);

        await act.Should().NotThrowAsync();
    }

    // === ExistsAsync ===

    [Fact]
    public async Task ExistsAsync_ExistingTask_ReturnsTrue()
    {
        var task = new TodoTask { Title = "Exists" };
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        var result = await _repo.ExistsAsync(task.Id);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task ExistsAsync_NonExistentTask_ReturnsFalse()
    {
        var result = await _repo.ExistsAsync(999);

        result.Should().BeFalse();
    }
}
