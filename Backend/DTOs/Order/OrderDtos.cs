namespace Backend.DTOs.Order;

public class OrderDto
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = null!;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}

public class CreateOrderDto
{
    public string CustomerName { get; set; } = null!;
    public List<CreateOrderItemDto> Items { get; set; } = new();
}

public class CreateOrderItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = null!;
}
