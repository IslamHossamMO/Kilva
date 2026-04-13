using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class User
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string? FullName { get; set; }

    public string? Email { get; set; }

    public string? PhoneNumber { get; set; }

    public string PasswordHash { get; set; } = null!;

    public decimal? Salary { get; set; }

    public string? Position { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    public virtual Company Company { get; set; } = null!;

    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
