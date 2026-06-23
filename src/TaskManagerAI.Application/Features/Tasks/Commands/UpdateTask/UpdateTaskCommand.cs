using MediatR;
using TaskManagerAI.Application.DTOs;
using TaskManagerAI.Domain.Enums;

namespace TaskManagerAI.Application.Features.Tasks.Commands.UpdateTask;

public record UpdateTaskCommand(
    Guid TaskId,
    string Title,
    string? Description,
    TaskPriority Priority,
    AppTaskStatus Status,
    DateTime? DueDate,
    Guid? AssignedToUserId = null
) : IRequest<AppTaskDto>;
