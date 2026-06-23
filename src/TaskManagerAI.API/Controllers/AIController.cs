using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagerAI.Application.DTOs;
using TaskManagerAI.Application.Features.AI.Commands.AnalyzeTask;

namespace TaskManagerAI.API.Controllers;

[ApiController]
[Authorize]
[Route("api/tasks")]
public class AIController : ControllerBase
{
    private readonly IMediator _mediator;

    public AIController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Analyzes a task using Claude AI to suggest priority and subtasks.
    /// Pass ?apply=true to automatically apply the suggestions to the task.
    /// </summary>
    [HttpPost("{id:guid}/analyze")]
    [ProducesResponseType(typeof(TaskAnalysisDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Analyze(
        Guid id,
        [FromQuery] bool apply = false,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new AnalyzeTaskCommand(id, apply), ct);
        return Ok(result);
    }
}
