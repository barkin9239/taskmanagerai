namespace TaskManagerAI.Application.DTOs;

public record TaskAnalysisDto(
    string SuggestedPriority,
    List<string> SuggestedSubTasks,
    string Reasoning
);
