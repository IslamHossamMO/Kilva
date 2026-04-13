using Backend.DTOs.Product;

namespace Backend.DTOs.Dashboard;

public class DashboardDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public int TotalOrders { get; set; }
    public List<ProductDto> LowStockProducts { get; set; } = new();
    public List<ActivityDto> RecentActivities { get; set; } = new();
    public List<DailyStatDto> ChartData { get; set; } = new();
}

public class ActivityDto
{
    public string Title { get; set; } = null!;
    public string? Detail { get; set; }
    public string Type { get; set; } = null!;
    public string? Amount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DailyStatDto
{
    public string Name { get; set; } = null!;
    public decimal Revenue { get; set; }
    public decimal Expenses { get; set; }
}
