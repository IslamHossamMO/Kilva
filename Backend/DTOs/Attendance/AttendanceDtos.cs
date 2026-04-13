using System;

namespace Backend.DTOs.Attendance;

public class AttendanceDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserFullName { get; set; } = null!;
    public DateTime Date { get; set; }
    public bool IsAbsent { get; set; }
    public decimal DeductionAmount { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAttendanceDto
{
    public int UserId { get; set; }
    public DateTime Date { get; set; }
    public bool IsAbsent { get; set; }
    public string? Note { get; set; }
}

public class AttendanceSummaryDto
{
    public int UserId { get; set; }
    public string UserFullName { get; set; } = null!;
    public decimal BaseSalary { get; set; }
    public int TotalAbsences { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal FinalSalary => BaseSalary - TotalDeductions;
}
