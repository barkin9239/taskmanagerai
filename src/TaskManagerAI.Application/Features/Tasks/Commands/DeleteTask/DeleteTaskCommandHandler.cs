using MediatR;
using TaskManagerAI.Application.Common.Exceptions;
using TaskManagerAI.Application.Common.Interfaces;
using TaskManagerAI.Domain.Entities;
using TaskManagerAI.Domain.Interfaces;

namespace TaskManagerAI.Application.Features.Tasks.Commands.DeleteTask;

public class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand, Unit>
{
    private readonly ITaskRepository _taskRepository;
    private readonly ICurrentUserService _currentUser;

    public DeleteTaskCommandHandler(ITaskRepository taskRepository, ICurrentUserService currentUser)
    {
        _taskRepository = taskRepository;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _taskRepository.GetByIdAsync(request.TaskId, cancellationToken)
            ?? throw new NotFoundException(nameof(AppTask), request.TaskId);

        if (task.UserId != _currentUser.UserId)
            throw new ForbiddenException();

        _taskRepository.Remove(task);
        await _taskRepository.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
