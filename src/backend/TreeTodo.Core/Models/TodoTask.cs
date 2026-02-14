using System.ComponentModel.DataAnnotations;
using TreeTodo.Core.Enums;

namespace TreeTodo.Core.Models;

public class TodoTask
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public bool IsCompleted { get; set; }

    public Priority Priority { get; set; } = Priority.Medium;

    public DateTime? DueDate { get; set; }

    public int? ParentId { get; set; }

    public TodoTask? Parent { get; set; }

    public List<TodoTask> Children { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int SortOrder { get; set; }
}
