using System.ComponentModel.DataAnnotations;
using TreeTodo.Core.Enums;

namespace TreeTodo.Core.DTOs;

public record UpdateTaskRequest(
    [Required][MaxLength(200)] string Title,
    [MaxLength(2000)] string? Description = null,
    Priority Priority = Priority.Medium,
    DateTime? DueDate = null,
    int SortOrder = 0
);
