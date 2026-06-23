using MediatR;
using TaskManagerAI.Application.DTOs;

namespace TaskManagerAI.Application.Features.Tasks.Commands.AssignTask;

public record AssignTaskCommand(Guid TaskId, Guid AssignedToUserId) : IRequest<AppTaskDto>;
