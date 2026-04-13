using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class Company
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Email { get; set; }

    public string? Address { get; set; }

    public bool? IsSubscribed { get; set; }

    public string? Currency { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    public virtual ICollection<Delivery> Deliveries { get; set; } = new List<Delivery>();

    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();

    public virtual ICollection<Setting> Settings { get; set; } = new List<Setting>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
