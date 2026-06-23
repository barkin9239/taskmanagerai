namespace TaskManagerAI.Application.Common.Interfaces;

public interface INotificationService
{
    Task NotifyTaskAssignedAsync(
        Guid assignedToUserId,
        Guid taskId,
        string taskTitle,
        string assignedByEmail,
        CancellationToken ct = default);
}
