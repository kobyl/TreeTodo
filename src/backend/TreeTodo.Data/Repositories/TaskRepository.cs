using Microsoft.EntityFrameworkCore;
using TreeTodo.Core.Enums;
using TreeTodo.Core.Interfaces;
using TreeTodo.Core.Models;

namespace TreeTodo.Data.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<TodoTask>> GetAllRootTasksAsync(bool includeCompleted = true, string? priority = null)
    {
        var query = _context.Tasks.AsQueryable();

        if (!includeCompleted)
            query = query.Where(t => !t.IsCompleted);

        if (!string.IsNullOrEmpty(priority) && Enum.TryParse<Priority>(priority, true, out var p))
            query = query.Where(t => t.Priority == p);

        // Load all matching tasks; EF change tracker auto-populates Children via relationship fix-up
        var allTasks = await query.OrderBy(t => t.SortOrder).ThenBy(t => t.Id).ToListAsync();

        return allTasks.Where(t => t.ParentId == null).ToList();
    }

    public async Task<TodoTask?> GetByIdAsync(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return null;

        // Load all tasks so EF change tracker populates Children via relationship fix-up
        await _context.Tasks.ToListAsync();
        return task;
    }

    public async Task<TodoTask> CreateAsync(TodoTask task)
    {
        task.CreatedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task<TodoTask> UpdateAsync(TodoTask task)
    {
        task.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task DeleteAsync(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task != null)
        {
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Tasks.AnyAsync(t => t.Id == id);
    }
}
