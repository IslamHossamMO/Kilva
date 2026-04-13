using Backend.DTOs.Dashboard;

namespace Backend.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardStatsAsync();
}
