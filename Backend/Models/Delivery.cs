using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class Delivery
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string? DriverName { get; set; }

    public string? RouteName { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Company Company { get; set; } = null!;

    public virtual ICollection<DeliveryItem> DeliveryItems { get; set; } = new List<DeliveryItem>();
}
