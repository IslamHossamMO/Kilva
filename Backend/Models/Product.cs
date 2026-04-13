using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class Product
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string? Name { get; set; }

    public string? SKU { get; set; }

    public string? Category { get; set; }

    public string? ImageUrl { get; set; }

    public decimal? Price { get; set; }

    public int? Stock { get; set; }

    public int? MinStock { get; set; }

    public virtual Company Company { get; set; } = null!;

    public virtual ICollection<DeliveryItem> DeliveryItems { get; set; } = new List<DeliveryItem>();

    public virtual ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
