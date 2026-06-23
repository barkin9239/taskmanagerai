using MediatR;
using TaskManagerAI.Application.DTOs;

namespace TaskManagerAI.Application.Features.Tasks.Commands.AssignTask;

public record AddSubTaskCommand(
    Guid AppTaskId,
    string Title
) : IRequest<SubTaskDto>;
