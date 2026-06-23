using MediatR;
using TaskManagerAI.Application.Common.Exceptions;
using TaskManagerAI.Application.Common.Interfaces;
using TaskManagerAI.Application.DTOs;
using TaskManagerAI.Domain.Entities;
using TaskManagerAI.Domain.Enums;
using TaskManagerAI.Domain.Interfaces;

namespace TaskManagerAI.Application.Features.AI.Commands.AnalyzeTask;

public class AnalyzeTaskCommandHandler : IRequestHandler<AnalyzeTaskCommand, TaskAnalysisDto>
{
    private readonly ITaskRepository _taskRepository;
    private readonly IRepository<SubTask> _subTaskRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IAIService _aiService;

    public AnalyzeTaskCommandHandler(
        ITaskRepository taskRepository,
        IRepository<SubTask> subTaskRepository,
        ICurrentUserService currentUser,
        IAIService aiService)
    {
        _taskRepository = taskRepository;
        _subTaskRepository = subTaskRepository;
        _currentUser = currentUser;
        _aiService = aiService;
    }

    public async Task<TaskAnalysisDto> Handle(AnalyzeTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _taskRepository.GetByIdAsync(request.TaskId, cancellationToken)
            ?? throw new NotFoundException(nameof(AppTask), request.TaskId);

        var currentUserId = _currentUser.UserId;
        var isOwner    = task.UserId == currentUserId;
        var isAssignee = task.AssignedToUserId.HasValue && task.AssignedToUserId.Value == currentUserId;

        if (!isOwner && !isAssignee)
            throw new ForbiddenException();

        var analysis = await _aiService.AnalyzeTaskAsync(task.Title, task.Description, cancellationToken);

        if (request.Apply)
            await ApplySuggestionsAsync(task, analysis, cancellationToken);

        return analysis;
    }

    private async Task ApplySuggestionsAsync(AppTask task, TaskAnalysisDto analysis, CancellationToken ct)
    {
        if (Enum.TryParse<TaskPriority>(analysis.SuggestedPriority, ignoreCase: true, out var priority))
            task.Priority = priority;

        _taskRepository.Update(task);
        await _taskRepository.SaveChangesAsync(ct);

        foreach (var title in analysis.SuggestedSubTasks)
        {
            var subTask = new SubTask
            {
                Title = title.Trim(),
                AppTaskId = task.Id
            };
            await _subTaskRepository.AddAsync(subTask, ct);
        }

        await _subTaskRepository.SaveChangesAsync(ct);
    }
}
