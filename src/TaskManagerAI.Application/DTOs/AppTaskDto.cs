using TaskManagerAI.Domain.Enums;

namespace TaskManagerAI.Application.DTOs;

public record AppTaskDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }          // task owner — for frontend role check
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public TaskPriority Priority { get; init; }
    public AppTaskStatus Status { get; init; }
    public DateTime? DueDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public Guid? AssignedToUserId { get; init; }
    public string AssignedToUserName { get; init; } = string.Empty;
    public string CreatedByName { get; init; } = string.Empty;
    public List<SubTaskDto> SubTasks { get; init; } = [];
}
