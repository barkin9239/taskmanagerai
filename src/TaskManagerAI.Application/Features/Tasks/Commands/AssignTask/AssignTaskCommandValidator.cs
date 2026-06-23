using FluentValidation;

namespace TaskManagerAI.Application.Features.Tasks.Commands.AssignTask;

public class AssignTaskCommandValidator : AbstractValidator<AssignTaskCommand>
{
    public AssignTaskCommandValidator()
    {
        RuleFor(x => x.TaskId)
            .NotEmpty().WithMessage("TaskId is required.");

        RuleFor(x => x.AssignedToUserId)
            .NotEmpty().WithMessage("AssignedToUserId is required.");
    }
}
