using MediatR;
using TaskManagerAI.Application.DTOs;
using TaskManagerAI.Domain.Enums;

namespace TaskManagerAI.Application.Features.Tasks.Commands.CreateTask;

public record CreateTaskCommand(
    string Title,
    string? Description,
    TaskPriority Priority,
    DateTime? DueDate,
    Guid? AssignedToUserId = null
) : IRequest<AppTaskDto>;
