using TaskManagerAI.Domain.Common;
using TaskManagerAI.Domain.Enums;

namespace TaskManagerAI.Domain.Entities;

public class AppTask : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public AppTaskStatus Status { get; set; } = AppTaskStatus.Todo;
    public DateTime? DueDate { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid? AssignedToUserId { get; set; }
    public User? AssignedToUser { get; set; }

    public ICollection<SubTask> SubTasks { get; set; } = new List<SubTask>();
}
