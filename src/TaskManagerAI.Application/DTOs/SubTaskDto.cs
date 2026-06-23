namespace TaskManagerAI.Application.DTOs;

public record SubTaskDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public bool IsCompleted { get; init; }
    public DateTime CreatedAt { get; init; }
}
