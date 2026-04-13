namespace Backend.Services.Interfaces;

public interface IAIService
{
    Task<string> QueryAsync(string question);
}
