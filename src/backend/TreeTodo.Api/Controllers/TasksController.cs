using Microsoft.AspNetCore.Mvc;
using TreeTodo.Core.DTOs;
using TreeTodo.Core.Interfaces;
using TreeTodo.Core.Models;

namespace TreeTodo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskRepository _repository;

    public TasksController(ITaskRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TaskResponse>>>> GetAll(
        [FromQuery] bool includeCompleted = true,
        [FromQuery] string? priority = null)
    {
        var tasks = await _repository.GetAllRootTasksAsync(includeCompleted, priority);
        var response = tasks.Select(MapToResponse).ToList();
        return Ok(ApiResponse<List<TaskResponse>>.Ok(response));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TaskResponse>>> GetById(int id)
    {
        var task = await _repository.GetByIdAsync(id);
        if (task == null)
            return NotFound(ApiResponse<TaskResponse>.Fail("Task not found"));

        return Ok(ApiResponse<TaskResponse>.Ok(MapToResponse(task)));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TaskResponse>>> Create(CreateTaskRequest request)
    {
        if (request.ParentId.HasValue)
        {
            var parentExists = await _repository.ExistsAsync(request.ParentId.Value);
            if (!parentExists)
                return BadRequest(ApiResponse<TaskResponse>.Fail("Parent task not found"));
        }

        var task = new TodoTask
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            DueDate = request.DueDate,
            ParentId = request.ParentId,
            SortOrder = request.SortOrder
        };

        var created = await _repository.CreateAsync(task);
        var response = MapToResponse(created);

        return CreatedAtAction(
            nameof(GetById),
            new { id = created.Id },
            ApiResponse<TaskResponse>.Ok(response));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<TaskResponse>>> Update(int id, UpdateTaskRequest request)
    {
        var task = await _repository.GetByIdAsync(id);
        if (task == null)
            return NotFound(ApiResponse<TaskResponse>.Fail("Task not found"));

        task.Title = request.Title;
        task.Description = request.Description;
        task.Priority = request.Priority;
        task.DueDate = request.DueDate;
        task.SortOrder = request.SortOrder;

        var updated = await _repository.UpdateAsync(task);
        return Ok(ApiResponse<TaskResponse>.Ok(MapToResponse(updated)));
    }

    [HttpPatch("{id}/toggle")]
    public async Task<ActionResult<ApiResponse<TaskResponse>>> Toggle(int id)
    {
        var task = await _repository.GetByIdAsync(id);
        if (task == null)
            return NotFound(ApiResponse<TaskResponse>.Fail("Task not found"));

        task.IsCompleted = !task.IsCompleted;

        var updated = await _repository.UpdateAsync(task);
        return Ok(ApiResponse<TaskResponse>.Ok(MapToResponse(updated)));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var exists = await _repository.ExistsAsync(id);
        if (!exists)
            return NotFound(ApiResponse<object>.Fail("Task not found"));

        await _repository.DeleteAsync(id);
        return NoContent();
    }

    private static TaskResponse MapToResponse(TodoTask task)
    {
        return new TaskResponse(
            task.Id,
            task.Title,
            task.Description,
            task.IsCompleted,
            task.Priority,
            task.DueDate,
            task.ParentId,
            task.CreatedAt,
            task.UpdatedAt,
            task.SortOrder,
            task.Children.Select(MapToResponse).ToList()
        );
    }
}
