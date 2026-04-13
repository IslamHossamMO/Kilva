using Backend.DTOs.Delivery;

namespace Backend.Services.Interfaces;

public interface IDeliveryService
{
    Task<IEnumerable<DeliveryDto>> GetAllDeliveriesAsync();
    Task<DeliveryDto?> GetDeliveryByIdAsync(int id);
    Task<DeliveryDto?> CreateDeliveryAsync(CreateDeliveryDto dto);
    Task<DeliveryDto?> UpdateDeliveryAsync(int id, UpdateDeliveryDto dto);
    Task<bool> UpdateDeliveryStatusAsync(int id, string status);
}
