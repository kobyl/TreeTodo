using TreeTodo.Core.Enums;

namespace TreeTodo.Core.DTOs;

public record TaskResponse(
    int Id,
    string Title,
    string? Description,
    bool IsCompleted,
    Priority Priority,
    DateTime? DueDate,
    int? ParentId,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int SortOrder,
    List<TaskResponse> Children
);
