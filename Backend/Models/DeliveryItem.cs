using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class DeliveryItem
{
    public int Id { get; set; }

    public int DeliveryId { get; set; }

    public int? ProductId { get; set; }

    public int? QuantitySent { get; set; }

    public int? QuantityReturned { get; set; }

    public virtual Delivery Delivery { get; set; } = null!;

    public virtual Product? Product { get; set; }
}
