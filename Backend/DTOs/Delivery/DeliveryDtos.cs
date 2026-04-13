namespace Backend.DTOs.Delivery;

public class DeliveryDto
{
    public int Id { get; set; }
    public string DriverName { get; set; } = null!;
    public string RouteName { get; set; } = null!;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public class CreateDeliveryDto
{
    public string DriverName { get; set; } = null!;
    public string RouteName { get; set; } = null!;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public List<int> OrderIds { get; set; } = new();
}

public class UpdateDeliveryDto
{
    public string? DriverName { get; set; }
    public string? RouteName { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
}

public class UpdateDeliveryStatusDto
{
    public string Status { get; set; } = null!;
}
