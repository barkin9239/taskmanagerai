using AutoMapper;
using MediatR;
using TaskManagerAI.Application.Common.Exceptions;
using TaskManagerAI.Application.Common.Interfaces;
using TaskManagerAI.Application.DTOs;
using TaskManagerAI.Domain.Entities;
using TaskManagerAI.Domain.Interfaces;

namespace TaskManagerAI.Application.Features.Tasks.Commands.AssignTask;

public class AssignTaskCommandHandler : IRequestHandler<AssignTaskCommand, AppTaskDto>
{
    private readonly ITaskRepository _taskRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notificationService;
    private readonly IMapper _mapper;

    public AssignTaskCommandHandler(
        ITaskRepository taskRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUser,
        INotificationService notificationService,
        IMapper mapper)
    {
        _taskRepository = taskRepository;
        _userRepository = userRepository;
        _currentUser = currentUser;
        _notificationService = notificationService;
        _mapper = mapper;
    }

    public async Task<AppTaskDto> Handle(AssignTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _taskRepository.GetWithSubTasksAsync(request.TaskId, cancellationToken)
            ?? throw new NotFoundException(nameof(AppTask), request.TaskId);

        if (task.UserId != _currentUser.UserId)
            throw new ForbiddenException("Only the task creator can assign it.");

        var targetUser = await _userRepository.GetByIdAsync(request.AssignedToUserId, cancellationToken)
            ?? throw new NotFoundException(nameof(User), request.AssignedToUserId);

        task.AssignedToUserId = request.AssignedToUserId;

        _taskRepository.Update(task);
        await _taskRepository.SaveChangesAsync(cancellationToken);

        await _notificationService.NotifyTaskAssignedAsync(
            assignedToUserId: request.AssignedToUserId,
            taskId: task.Id,
            taskTitle: task.Title,
            assignedByEmail: _currentUser.Email,
            ct: cancellationToken);

        return _mapper.Map<AppTaskDto>(task);
    }
}
