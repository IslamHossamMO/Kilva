using Backend.DTOs.AuditLog;
using Backend.Repositories.Interfaces;
using Backend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/audit-logs")]
[Authorize]
public class AuditLogController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;

    public AuditLogController(IUnitOfWork unitOfWork, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
    }

    [HttpGet]
    [Authorize(Policy = "audit-logs.view")]
    public async Task<IActionResult> GetAll()
    {
        var companyId = _userContext.CompanyId ?? 0;
        var logs = await _unitOfWork.AuditLogs.FindAsync(l => l.CompanyId == companyId);
        
        return Ok(logs.OrderByDescending(l => l.CreatedAt).Select(l => new AuditLogDto
        {
            Id = l.Id,
            Action = l.Action ?? "",
            Entity = l.Entity ?? "",
            UserId = l.UserId,
            CreatedAt = l.CreatedAt ?? DateTime.UtcNow
        }));
    }
}
