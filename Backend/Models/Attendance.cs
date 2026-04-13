using System;

namespace Backend.Models;

public partial class Attendance
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int CompanyId { get; set; }
    public DateTime Date { get; set; }
    public bool IsAbsent { get; set; }
    public decimal DeductionAmount { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
    public virtual Company Company { get; set; } = null!;
}
