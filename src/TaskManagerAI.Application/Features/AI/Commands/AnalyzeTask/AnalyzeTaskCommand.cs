using MediatR;
using TaskManagerAI.Application.DTOs;

namespace TaskManagerAI.Application.Features.AI.Commands.AnalyzeTask;

public record AnalyzeTaskCommand(Guid TaskId, bool Apply = false) : IRequest<TaskAnalysisDto>;
