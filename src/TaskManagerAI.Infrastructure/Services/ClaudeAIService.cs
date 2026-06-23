using System.Text.Json;
using System.Text.RegularExpressions;
using Anthropic.SDK;
using Anthropic.SDK.Messaging;
using Microsoft.Extensions.Configuration;
using TaskManagerAI.Application.Common.Interfaces;
using TaskManagerAI.Application.DTOs;

namespace TaskManagerAI.Infrastructure.Services;

public class ClaudeAIService : IAIService
{
    private readonly string _apiKey;
    private const string Model = "claude-sonnet-4-6";
    private const int MaxTokens = 1024;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public ClaudeAIService(IConfiguration configuration)
    {
        _apiKey = configuration["AnthropicSettings:ApiKey"]
            ?? throw new InvalidOperationException("AnthropicSettings:ApiKey is not configured.");
    }

    public async Task<TaskAnalysisDto> AnalyzeTaskAsync(string title, string description, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey) || _apiKey == "YOUR_ANTHROPIC_API_KEY_HERE")
            throw new InvalidOperationException("Anthropic API key is not set. Please configure AnthropicSettings:ApiKey.");

        var client = new AnthropicClient(_apiKey);

        var parameters = new MessageParameters
        {
            Messages =
            [
                new Message
                {
                    Role = RoleType.User,
                    Content = [new TextContent { Text = BuildPrompt(title, description) }]
                }
            ],
            Model = Model,
            MaxTokens = MaxTokens,
            Stream = false
        };

        var response = await client.Messages.GetClaudeMessageAsync(parameters);

        var rawText = response.Content.OfType<TextContent>().FirstOrDefault()?.Text
            ?? throw new InvalidOperationException("Claude returned an empty response.");

        return ParseResponse(rawText);
    }

    private static string BuildPrompt(string title, string description)
    {
        var desc = string.IsNullOrWhiteSpace(description) ? "(no description provided)" : description;
        return $$"""
        You are a task management AI assistant. Analyze the following task and provide actionable suggestions.

        Task Title: {{title}}
        Task Description: {{desc}}

        Respond ONLY with valid JSON in this exact format (no markdown code blocks, no extra text):
        {
          "suggestedPriority": "Medium",
          "suggestedSubTasks": ["Research requirements", "Create implementation plan", "Write unit tests"],
          "reasoning": "Brief explanation of why this priority and these subtasks are appropriate"
        }

        Rules:
        - suggestedPriority must be exactly one of: Low, Medium, High, Urgent
        - suggestedSubTasks must contain 3 to 5 specific, actionable items
        - reasoning should be 1-2 sentences explaining your analysis
        """;
    }

    private static TaskAnalysisDto ParseResponse(string text)
    {
        // Strip markdown code blocks if Claude wraps the JSON
        var json = Regex.Replace(
            text.Trim(),
            @"^```(?:json)?\s*|\s*```$",
            string.Empty,
            RegexOptions.Multiline
        ).Trim();

        var raw = JsonSerializer.Deserialize<RawAnalysis>(json, JsonOptions)
            ?? throw new InvalidOperationException("Claude returned a null or unparseable response.");

        return new TaskAnalysisDto(
            SuggestedPriority: raw.SuggestedPriority ?? "Medium",
            SuggestedSubTasks: raw.SuggestedSubTasks ?? [],
            Reasoning: raw.Reasoning ?? string.Empty
        );
    }

    private sealed record RawAnalysis(
        string? SuggestedPriority,
        List<string>? SuggestedSubTasks,
        string? Reasoning
    );
}
