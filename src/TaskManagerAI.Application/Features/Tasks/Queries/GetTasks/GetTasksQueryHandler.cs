using AutoMapper;
using MediatR;
using TaskManagerAI.Application.Common.Interfaces;
using TaskManagerAI.Application.DTOs;
using TaskManagerAI.Domain.Interfaces;

namespace TaskManagerAI.Application.Features.Tasks.Queries.GetTasks;

public class GetTasksQueryHandler : IRequestHandler<GetTasksQuery, List<AppTaskDto>>
{
    private readonly ITaskRepository _taskRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public GetTasksQueryHandler(
        ITaskRepository taskRepository,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _taskRepository = taskRepository;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<List<AppTaskDto>> Handle(GetTasksQuery request, CancellationToken cancellationToken)
    {
        var tasks = await _taskRepository.GetByUserIdAsync(
            _currentUser.UserId,
            request.View,
            request.Status,
            request.Priority,
            cancellationToken);

        return _mapper.Map<List<AppTaskDto>>(tasks);
    }
}
