using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Backend.Helpers;
using System.Text.Json;
using System.Text;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;

namespace Backend.Services.Implementation;

public class AIService : IAIService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public AIService(IUnitOfWork unitOfWork, IUserContext userContext, HttpClient httpClient, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> QueryAsync(string question)
    {
        var companyId = _userContext.CompanyId ?? 0;

        // 1. Fetch relevant company data
        var orders = await _unitOfWork.Orders.FindAsync(o => o.CompanyId == companyId);
        var expenses = await _unitOfWork.Expenses.FindAsync(e => e.CompanyId == companyId);
        var products = await _unitOfWork.Products.FindAsync(p => p.CompanyId == companyId);
        var users = await _unitOfWork.Users.FindAsync(u => u.CompanyId == companyId);

        var dataSummary = new
        {
            TotalOrders = orders.Count(),
            TotalRevenue = orders.Where(o => o.Status == "Completed").Sum(o => o.TotalAmount),
            TotalExpenses = expenses.Sum(e => e.Amount),
            LowStockProducts = products.Where(p => (p.Stock ?? 0) < 10).Select(p => new { p.Name, Stock = p.Stock }).ToList(),
            RecentOrders = orders.OrderByDescending(o => o.CreatedAt).Take(5).Select(o => new { o.CustomerName, o.TotalAmount, o.Status }).ToList(),
            TotalStaff = users.Count()
        };

        // 2. Build system prompt
        var systemPrompt = "You are an intelligent Business Assistant for the 'Kilva' company management suite. " +
                           "Our platform handles: Team Management (Users/Roles), Inventory (Products/Stock), Sales (Orders), Finances (Expenses), and Logistics (Deliveries). " +
                           "You have access to real-time business data. Provide concise, professional, and actionable insights. " +
                           "If asked about system features, explain how to use the relevant modules (e.g., 'To add a product, go to Inventory and click Add Product'). " +
                           $"Current Business Data Summary: {JsonSerializer.Serialize(dataSummary)}";

        // 3. Prepare OpenRouter / Minimax request
        var model = _configuration["AI:Model"] ?? "google/gemma-2-9b-it:free";
        var apiKey = _configuration["AI:ApiKey"];

        var requestBody = new
        {
            model = model,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = question }
            }
        };

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        
        try
        {
            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("https://openrouter.ai/api/v1/chat/completions", content);
            
            if (!response.IsSuccessStatusCode) 
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return $"AI service error ({response.StatusCode}): {errorContent}";
            }

            var resultJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(resultJson);
            var aiResponse = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();
            
            return aiResponse ?? "AI model did not return a response.";
        }
        catch (Exception ex)
        {
            return $"AI Assistant Error: {ex.Message}";
        }
    }
}
