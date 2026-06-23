using AutoMapper;
using MediatR;
using TaskManagerAI.Application.Common.Exceptions;
using TaskManagerAI.Application.Common.Interfaces;
using TaskManagerAI.Application.DTOs;
using TaskManagerAI.Domain.Entities;
using TaskManagerAI.Domain.Interfaces;

namespace TaskManagerAI.Application.Features.Tasks.Commands.UpdateTask;

public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, AppTaskDto>
{
    private readonly ITaskRepository _taskRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public UpdateTaskCommandHandler(
        ITaskRepository taskRepository,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _taskRepository = taskRepository;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<AppTaskDto> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _taskRepository.GetWithSubTasksAsync(request.TaskId, cancellationToken)
            ?? throw new NotFoundException(nameof(AppTask), request.TaskId);

        var currentUserId = _currentUser.UserId;
        var isOwner    = task.UserId == currentUserId;
        var isAssignee = task.AssignedToUserId.HasValue && task.AssignedToUserId.Value == currentUserId;

        if (!isOwner && !isAssignee)
            throw new ForbiddenException();

        if (isOwner)
        {
            // Owner can change everything
            task.Title = request.Title.Trim();
            task.Description = request.Description?.Trim() ?? string.Empty;
            task.Priority = request.Priority;
            task.DueDate = request.DueDate.HasValue
                ? DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc)
                : null;
            task.AssignedToUserId = request.AssignedToUserId;
        }
        // Assignee (non-owner): silently ignore all fields except Status

        // Both owner and assignee can change Status
        task.Status = request.Status;

        _taskRepository.Update(task);
        await _taskRepository.SaveChangesAsync(cancellationToken);

        return _mapper.Map<AppTaskDto>(task);
    }
}
