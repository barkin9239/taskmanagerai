using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagerAI.Application.Common.Interfaces;
using TaskManagerAI.Application.DTOs;
using TaskManagerAI.Domain.Interfaces;

namespace TaskManagerAI.API.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUser;

    public UsersController(IUserRepository userRepository, ICurrentUserService currentUser)
    {
        _userRepository = userRepository;
        _currentUser = currentUser;
    }

    [HttpGet("search")]
    [ProducesResponseType(typeof(IEnumerable<UserSearchDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] string query, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 1)
            return Ok(Array.Empty<UserSearchDto>());

        var users = await _userRepository.SearchByEmailPrefixAsync(
            query.Trim(),
            excludeUserId: _currentUser.UserId,
            limit: 5,
            ct: ct);

        var dtos = users.Select(u => new UserSearchDto(u.Id, u.Email, u.Name));
        return Ok(dtos);
    }
}
