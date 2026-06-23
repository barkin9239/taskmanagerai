using MediatR;
using TaskManagerAI.Application.Common.Exceptions;
using TaskManagerAI.Application.Common.Interfaces;
using TaskManagerAI.Application.DTOs;
using TaskManagerAI.Domain.Entities;
using TaskManagerAI.Domain.Interfaces;

namespace TaskManagerAI.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public RegisterCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.ToLowerInvariant();

        if (await _userRepository.ExistsByEmailAsync(normalizedEmail, cancellationToken))
            throw new ConflictException($"Email '{normalizedEmail}' is already registered.");

        var user = new User
        {
            Email = normalizedEmail,
            Name = request.Name.Trim(),
            PasswordHash = _passwordHasher.Hash(request.Password)
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _userRepository.SaveChangesAsync(cancellationToken);

        return new AuthResponseDto(
            Token: _tokenService.GenerateToken(user),
            UserId: user.Id,
            Email: user.Email,
            Name: user.Name,
            ExpiresAt: _tokenService.GetExpiryTime()
        );
    }
}
