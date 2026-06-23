using MediatR;
using TaskManagerAI.Application.DTOs;

namespace TaskManagerAI.Application.Features.Tasks.Queries.GetTaskById;

public record GetTaskByIdQuery(Guid TaskId) : IRequest<AppTaskDto>;
