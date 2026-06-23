using MediatR;
using TaskManagerAI.Application.DTOs;
using TaskManagerAI.Domain.Enums;

namespace TaskManagerAI.Application.Features.Tasks.Queries.GetTasks;

public record GetTasksQuery(
    string View = "created",        // "created" | "assigned"
    AppTaskStatus? Status = null,
    TaskPriority? Priority = null
) : IRequest<List<AppTaskDto>>;
