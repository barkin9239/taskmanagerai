using AutoMapper;
using MediatR;
using TaskManagerAI.Application.Common.Exceptions;
using TaskManagerAI.Application.Common.Interfaces;
using TaskManagerAI.Application.DTOs;
using TaskManagerAI.Domain.Entities;
using TaskManagerAI.Domain.Interfaces;

namespace TaskManagerAI.Application.Features.Tasks.Queries.GetTaskById;

public class GetTaskByIdQueryHandler : IRequestHandler<GetTaskByIdQuery, AppTaskDto>
{
    private readonly ITaskRepository _taskRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public GetTaskByIdQueryHandler(
        ITaskRepository taskRepository,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _taskRepository = taskRepository;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<AppTaskDto> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
    {
        var task = await _taskRepository.GetWithSubTasksAsync(request.TaskId, cancellationToken)
            ?? throw new NotFoundException(nameof(AppTask), request.TaskId);

        if (task.UserId != _currentUser.UserId)
            throw new ForbiddenException();

        return _mapper.Map<AppTaskDto>(task);
    }
}
