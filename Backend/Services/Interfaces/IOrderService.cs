using Backend.DTOs.Order;

namespace Backend.Services.Interfaces;

public interface IOrderService
{
    Task<IEnumerable<OrderDto>> GetAllOrdersAsync();
    Task<OrderDto?> GetOrderByIdAsync(int id);
    Task<OrderDto?> CreateOrderAsync(CreateOrderDto dto);
    Task<bool> UpdateOrderStatusAsync(int id, string status);
}
