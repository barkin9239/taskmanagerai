using TaskManagerAI.Domain.Entities;

namespace TaskManagerAI.Domain.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default);
    Task<IReadOnlyList<User>> SearchByEmailPrefixAsync(string query, Guid excludeUserId, int limit = 5, CancellationToken ct = default);
}
