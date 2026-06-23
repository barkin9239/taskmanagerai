using Microsoft.AspNetCore.SignalR;
using TaskManagerAI.Application.Common.Interfaces;
using TaskManagerAI.Infrastructure.Hubs;

namespace TaskManagerAI.Infrastructure.Services;

public class SignalRNotificationService : INotificationService
{
    private readonly IHubContext<TaskHub> _hubContext;

    public SignalRNotificationService(IHubContext<TaskHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyTaskAssignedAsync(
        Guid assignedToUserId,
        Guid taskId,
        string taskTitle,
        string assignedByEmail,
        CancellationToken ct = default)
    {
        var payload = new
        {
            TaskId = taskId,
            TaskTitle = taskTitle,
            AssignedByEmail = assignedByEmail,
            AssignedAt = DateTime.UtcNow
        };

        await _hubContext.Clients
            .Group(assignedToUserId.ToString())
            .SendAsync("TaskAssigned", payload, ct);
    }
}
