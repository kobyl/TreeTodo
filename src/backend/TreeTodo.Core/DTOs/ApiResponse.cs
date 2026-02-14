namespace TreeTodo.Core.DTOs;

public record ApiResponse<T>(
    bool Success,
    T? Data,
    List<string> Errors
)
{
    public static ApiResponse<T> Ok(T data) => new(true, data, new List<string>());
    public static ApiResponse<T> Fail(List<string> errors) => new(false, default, errors);
    public static ApiResponse<T> Fail(string error) => new(false, default, new List<string> { error });
}
