using TreeTodo.Core.Models;

namespace TreeTodo.Core.Interfaces;

public interface ITaskRepository
{
    Task<List<TodoTask>> GetAllRootTasksAsync(bool includeCompleted = true, string? priority = null);
    Task<TodoTask?> GetByIdAsync(int id);
    Task<TodoTask> CreateAsync(TodoTask task);
    Task<TodoTask> UpdateAsync(TodoTask task);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
