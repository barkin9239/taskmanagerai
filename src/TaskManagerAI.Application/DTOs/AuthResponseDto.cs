namespace TaskManagerAI.Application.DTOs;

public record AuthResponseDto(
    string Token,
    Guid UserId,
    string Email,
    string Name,
    DateTime ExpiresAt
);
