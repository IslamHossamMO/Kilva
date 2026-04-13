using Backend.DTOs.Dashboard;
using Backend.DTOs.Product;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Backend.Helpers;

namespace Backend.Services.Implementation;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;

    public DashboardService(IUnitOfWork unitOfWork, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
    }

    public async Task<DashboardDto> GetDashboardStatsAsync()
    {
        var companyId = _userContext.CompanyId ?? 0;
        
        // Stats
        var orders = await _unitOfWork.Orders.FindAsync(o => o.CompanyId == companyId);
        var completedOrders = orders.Where(o => (o.Status == "Completed" || o.Status == "Delivered")).ToList();
        var totalRevenue = completedOrders.Sum(o => o.TotalAmount ?? 0);
        var totalOrders = orders.Count();

        var expenses = await _unitOfWork.Expenses.FindAsync(e => e.CompanyId == companyId);
        var totalExpenses = expenses.Sum(e => e.Amount);

        // Low Stock
        var lowStockProducts = await _unitOfWork.Products.FindAsync(p => p.CompanyId == companyId && (p.Stock ?? 0) < 10);
        
        // 1. Calculate Chart Data (last 7 days)
        var chartData = new List<DailyStatDto>();
        for (int i = 6; i >= 0; i--)
        {
            var date = DateTime.UtcNow.Date.AddDays(-i);
            var dayRevenue = completedOrders.Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value.Date == date).Sum(o => o.TotalAmount ?? 0);
            var dayExpenses = expenses.Where(e => e.Date.Date == date).Sum(e => e.Amount);

            chartData.Add(new DailyStatDto
            {
                Name = date.ToString("ddd"),
                Revenue = dayRevenue,
                Expenses = dayExpenses
            });
        }

        // 2. Fetch Rich Recent Activities from AuditLogs
        var recentAuditLogs = await _unitOfWork.AuditLogs.FindAsync(al => al.CompanyId == companyId);
        var recentActivities = recentAuditLogs.OrderByDescending(al => al.CreatedAt)
            .Take(10)
            .Select(al => {
                string? amount = null;
                if (al.Entity == "Order" && al.Action == "Create")
                {
                    var order = orders.FirstOrDefault(o => o.Id == al.EntityId);
                    if (order != null) amount = $"+${order.TotalAmount?.ToString("N0")}";
                }
                else if (al.Entity == "Expense" && al.Action == "Create")
                {
                    var expense = expenses.FirstOrDefault(e => e.Id == al.EntityId);
                    if (expense != null) amount = $"-${expense.Amount.ToString("N0")}";
                }

                return new ActivityDto
                {
                    Title = al.Action == "Create" ? $"New {al.Entity}" : $"{al.Action} {al.Entity}",
                    Detail = $"ID #{al.EntityId}",
                    Type = al.Entity ?? "System",
                    CreatedAt = al.CreatedAt ?? DateTime.UtcNow,
                    Amount = amount
                };
            }).ToList();

        return new DashboardDto
        {
            TotalRevenue = totalRevenue,
            TotalExpenses = totalExpenses,
            TotalOrders = totalOrders,
            ChartData = chartData,
            RecentActivities = recentActivities,
            LowStockProducts = lowStockProducts.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name ?? "Unknown",
                Stock = p.Stock ?? 0,
                Price = p.Price ?? 0
            }).ToList()
        };
    }
}
