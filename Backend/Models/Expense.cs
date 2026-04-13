using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class Expense
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string? Title { get; set; }

    public decimal Amount { get; set; }

    public string? Category { get; set; }

    public DateTime Date { get; set; }

    public int? CreatedBy { get; set; }

    public virtual Company Company { get; set; } = null!;

    public virtual User? CreatedByNavigation { get; set; }
}
