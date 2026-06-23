using TaskManagerAI.Domain.Entities;

namespace TaskManagerAI.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
    DateTime GetExpiryTime();
}
