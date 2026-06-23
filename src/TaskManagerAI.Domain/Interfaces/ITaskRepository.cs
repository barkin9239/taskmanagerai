using TaskManagerAI.Domain.Entities;
using TaskManagerAI.Domain.Enums;

namespace TaskManagerAI.Domain.Interfaces;

public interface ITaskRepository : IRepository<AppTask>
{
    Task<AppTask?> GetWithSubTasksAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<AppTask>> GetByUserIdAsync(
        Guid userId,
        string view = "created",
        AppTaskStatus? status = null,
        TaskPriority? priority = null,
        CancellationToken ct = default);
}
