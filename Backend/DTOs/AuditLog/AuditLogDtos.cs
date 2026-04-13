namespace Backend.DTOs.AuditLog;

public class AuditLogDto
{
    public int Id { get; set; }
    public string Action { get; set; } = null!;
    public string Entity { get; set; } = null!;
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public DateTime? CreatedAt { get; set; }
}
