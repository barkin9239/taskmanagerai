using Microsoft.EntityFrameworkCore;
using TaskManagerAI.Domain.Entities;
using TaskManagerAI.Domain.Enums;
using TaskManagerAI.Domain.Interfaces;
using TaskManagerAI.Infrastructure.Persistence;

namespace TaskManagerAI.Infrastructure.Repositories;

public class TaskRepository : GenericRepository<AppTask>, ITaskRepository
{
    public TaskRepository(ApplicationDbContext context) : base(context) { }

    public async Task<AppTask?> GetWithSubTasksAsync(Guid id, CancellationToken ct = default)
        => await _dbSet
            .Include(t => t.User)
            .Include(t => t.AssignedToUser)
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<IReadOnlyList<AppTask>> GetByUserIdAsync(
        Guid userId,
        string view = "created",
        AppTaskStatus? status = null,
        TaskPriority? priority = null,
        CancellationToken ct = default)
    {
        var query = _dbSet
            .AsNoTracking()
            .Include(t => t.User)
            .Include(t => t.AssignedToUser)
            .Include(t => t.SubTasks);

        // view-based filter
        var filtered = view == "assigned"
            ? query.Where(t => t.AssignedToUserId == userId)
            : query.Where(t => t.UserId == userId);

        if (status.HasValue)
            filtered = filtered.Where(t => t.Status == status.Value);

        if (priority.HasValue)
            filtered = filtered.Where(t => t.Priority == priority.Value);

        return await filtered
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(ct);
    }
}
