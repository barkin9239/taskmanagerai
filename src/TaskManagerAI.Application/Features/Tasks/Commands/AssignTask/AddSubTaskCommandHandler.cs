using AutoMapper;
using MediatR;
using TaskManagerAI.Application.Common.Exceptions;
using TaskManagerAI.Application.Common.Interfaces;
using TaskManagerAI.Application.DTOs;
using TaskManagerAI.Domain.Entities;
using TaskManagerAI.Domain.Interfaces;

namespace TaskManagerAI.Application.Features.Tasks.Commands.AssignTask;

public class AddSubTaskCommandHandler : IRequestHandler<AddSubTaskCommand, SubTaskDto>
{
    private readonly ITaskRepository _taskRepository;
    private readonly IRepository<SubTask> _subTaskRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public AddSubTaskCommandHandler(
        ITaskRepository taskRepository,
        IRepository<SubTask> subTaskRepository,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _taskRepository = taskRepository;
        _subTaskRepository = subTaskRepository;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<SubTaskDto> Handle(AddSubTaskCommand request, CancellationToken cancellationToken)
    {
        var parentTask = await _taskRepository.GetByIdAsync(request.AppTaskId, cancellationToken)
            ?? throw new NotFoundException(nameof(AppTask), request.AppTaskId);

        if (parentTask.UserId != _currentUser.UserId)
            throw new ForbiddenException();

        var subTask = new SubTask
        {
            Title = request.Title.Trim(),
            AppTaskId = request.AppTaskId
        };

        await _subTaskRepository.AddAsync(subTask, cancellationToken);
        await _subTaskRepository.SaveChangesAsync(cancellationToken);

        return _mapper.Map<SubTaskDto>(subTask);
    }
}
