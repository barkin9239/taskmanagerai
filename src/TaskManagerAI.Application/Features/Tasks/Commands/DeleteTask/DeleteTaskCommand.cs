using MediatR;

namespace TaskManagerAI.Application.Features.Tasks.Commands.DeleteTask;

public record DeleteTaskCommand(Guid TaskId) : IRequest<Unit>;
