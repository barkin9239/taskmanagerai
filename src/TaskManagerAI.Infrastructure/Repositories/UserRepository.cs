using Microsoft.EntityFrameworkCore;
using TaskManagerAI.Domain.Entities;
using TaskManagerAI.Domain.Interfaces;
using TaskManagerAI.Infrastructure.Persistence;

namespace TaskManagerAI.Infrastructure.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
        => await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), ct);

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default)
        => await _dbSet
            .AnyAsync(u => u.Email == email.ToLowerInvariant(), ct);

    public async Task<IReadOnlyList<User>> SearchByEmailPrefixAsync(
        string query, Guid excludeUserId, int limit = 5, CancellationToken ct = default)
        => await _dbSet
            .AsNoTracking()
            .Where(u => u.Id != excludeUserId && u.Email.StartsWith(query.ToLowerInvariant()))
            .OrderBy(u => u.Email)
            .Take(limit)
            .ToListAsync(ct);
}
