using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class InventoryTransaction
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public int ChangeAmount { get; set; }

    public string? Type { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Product Product { get; set; } = null!;
}
