using MediatR;
using TaskManagerAI.Application.DTOs;

namespace TaskManagerAI.Application.Features.Auth.Commands.Register;

public record RegisterCommand(string Email, string Password, string Name) : IRequest<AuthResponseDto>;
