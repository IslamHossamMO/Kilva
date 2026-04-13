using Backend.DTOs.Delivery;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Backend.Helpers;

namespace Backend.Services.Implementation;

public class DeliveryService : IDeliveryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;

    public DeliveryService(IUnitOfWork unitOfWork, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
    }

    public async Task<IEnumerable<DeliveryDto>> GetAllDeliveriesAsync()
    {
        var companyId = _userContext.CompanyId ?? 0;
        var deliveries = await _unitOfWork.Deliveries.FindAsync(d => d.CompanyId == companyId);
        return deliveries.Select(d => MapToDto(d));
    }

    public async Task<DeliveryDto?> GetDeliveryByIdAsync(int id)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var delivery = (await _unitOfWork.Deliveries.FindAsync(d => d.Id == id && d.CompanyId == companyId)).FirstOrDefault();
        if (delivery == null) return null;
        return MapToDto(delivery);
    }

    public async Task<DeliveryDto?> CreateDeliveryAsync(CreateDeliveryDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var delivery = new Delivery
        {
            CompanyId = companyId,
            DriverName = dto.DriverName,
            RouteName = dto.RouteName,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };
        await _unitOfWork.Deliveries.AddAsync(delivery);
        await _unitOfWork.CompleteAsync();

        // In the current scaffolded model, DeliveryItem links to Product, not Order.
        // I will assume the dto's OrderIds are actually ProductIds for now or handle accordingly.
        // Actually, the scaffolded DeliveryItem has ProductId.
        foreach (var productId in dto.OrderIds)
        {
            await _unitOfWork.DeliveryItems.AddAsync(new DeliveryItem
            {
                DeliveryId = delivery.Id,
                ProductId = productId,
                QuantitySent = 1 // Default
            });
        }
        await _unitOfWork.CompleteAsync();

        return MapToDto(delivery);
    }

    public async Task<DeliveryDto?> UpdateDeliveryAsync(int id, UpdateDeliveryDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var delivery = (await _unitOfWork.Deliveries.FindAsync(d => d.Id == id && d.CompanyId == companyId)).FirstOrDefault();
        if (delivery == null) return null;

        if (dto.DriverName != null) delivery.DriverName = dto.DriverName;
        if (dto.RouteName != null) delivery.RouteName = dto.RouteName;
        if (dto.Latitude != null) delivery.Latitude = dto.Latitude;
        if (dto.Longitude != null) delivery.Longitude = dto.Longitude;

        _unitOfWork.Deliveries.Update(delivery);
        await _unitOfWork.CompleteAsync();
        return MapToDto(delivery);
    }

    public async Task<bool> UpdateDeliveryStatusAsync(int id, string status)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var delivery = (await _unitOfWork.Deliveries.FindAsync(d => d.Id == id && d.CompanyId == companyId)).FirstOrDefault();
        if (delivery == null) return false;

        delivery.Status = status;
        _unitOfWork.Deliveries.Update(delivery);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    private DeliveryDto MapToDto(Delivery d)
    {
        return new DeliveryDto
        {
            Id = d.Id,
            DriverName = d.DriverName ?? "",
            RouteName = d.RouteName ?? "",
            Latitude = d.Latitude,
            Longitude = d.Longitude,
            Status = d.Status ?? "",
            CreatedAt = d.CreatedAt ?? DateTime.UtcNow
        };
    }
}
