using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagerAI.Application.DTOs;
using TaskManagerAI.Application.Features.Tasks.Commands.AssignTask;
using TaskManagerAI.Application.Features.Tasks.Commands.CreateTask;
using TaskManagerAI.Application.Features.Tasks.Commands.DeleteTask;
using TaskManagerAI.Application.Features.Tasks.Commands.UpdateTask;
using TaskManagerAI.Application.Features.Tasks.Queries.GetTaskById;
using TaskManagerAI.Application.Features.Tasks.Queries.GetTasks;
using TaskManagerAI.Domain.Enums;

namespace TaskManagerAI.API.Controllers;

[ApiController]
[Authorize]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly IMediator _mediator;

    public TasksController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [ProducesResponseType(typeof(List<AppTaskDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string view = "created",
        [FromQuery] AppTaskStatus? status = null,
        [FromQuery] TaskPriority? priority = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetTasksQuery(view, status, priority), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AppTaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTaskByIdQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(AppTaskDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateTaskCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AppTaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command with { TaskId = id }, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteTaskCommand(id), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/subtasks")]
    [ProducesResponseType(typeof(SubTaskDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddSubTask(Guid id, [FromBody] AddSubTaskCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command with { AppTaskId = id }, ct);
        return CreatedAtAction(nameof(GetById), new { id }, result);
    }

    [HttpPost("{id:guid}/assign")]
    [ProducesResponseType(typeof(AppTaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignTaskCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command with { TaskId = id }, ct);
        return Ok(result);
    }
}
