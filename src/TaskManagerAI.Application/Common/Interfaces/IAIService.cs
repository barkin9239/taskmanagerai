using TaskManagerAI.Application.DTOs;

namespace TaskManagerAI.Application.Common.Interfaces;

public interface IAIService
{
    Task<TaskAnalysisDto> AnalyzeTaskAsync(string title, string description, CancellationToken ct = default);
}
