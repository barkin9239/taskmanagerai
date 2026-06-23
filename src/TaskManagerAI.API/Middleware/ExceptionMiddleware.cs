using System.Net;
using System.Text.Json;
using TaskManagerAI.Application.Common.Exceptions;

namespace TaskManagerAI.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, errors) = exception switch
        {
            ValidationException vex => (HttpStatusCode.BadRequest, vex.Errors),
            ConflictException => (HttpStatusCode.Conflict, SingleError(exception.Message)),
            UnauthorizedException => (HttpStatusCode.Unauthorized, SingleError(exception.Message)),
            ForbiddenException => (HttpStatusCode.Forbidden, SingleError(exception.Message)),
            NotFoundException => (HttpStatusCode.NotFound, SingleError(exception.Message)),
            _ => (HttpStatusCode.InternalServerError, SingleError("An unexpected error occurred."))
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new { errors };
        return context.Response.WriteAsync(JsonSerializer.Serialize(response,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }

    private static IDictionary<string, string[]> SingleError(string message) =>
        new Dictionary<string, string[]> { ["general"] = [message] };
}
