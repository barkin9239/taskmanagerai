using TaskManagerAI.Domain.Common;

namespace TaskManagerAI.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public ICollection<AppTask> Tasks { get; set; } = new List<AppTask>();
    public ICollection<AppTask> AssignedTasks { get; set; } = new List<AppTask>();
}
