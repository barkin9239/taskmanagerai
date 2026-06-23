using TaskManagerAI.Domain.Common;

namespace TaskManagerAI.Domain.Entities;

public class SubTask : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; } = false;

    public Guid AppTaskId { get; set; }
    public AppTask AppTask { get; set; } = null!;
}
