using FluentValidation;

namespace TaskManagerAI.Application.Features.Tasks.Commands.AssignTask;

public class AddSubTaskCommandValidator : AbstractValidator<AddSubTaskCommand>
{
    public AddSubTaskCommandValidator()
    {
        RuleFor(x => x.AppTaskId)
            .NotEmpty().WithMessage("AppTaskId is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("SubTask title is required.")
            .MaximumLength(200).WithMessage("SubTask title must not exceed 200 characters.");
    }
}
