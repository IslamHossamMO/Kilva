using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class Order
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string? CustomerName { get; set; }

    public decimal? TotalAmount { get; set; }

    public string? Status { get; set; }

    public string? ReceiptUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public virtual Company Company { get; set; } = null!;

    public virtual User? CreatedByNavigation { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
