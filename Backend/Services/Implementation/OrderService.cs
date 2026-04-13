using Backend.DTOs.Order;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Backend.Helpers;

namespace Backend.Services.Implementation;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;

    public OrderService(IUnitOfWork unitOfWork, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
    }

    public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
    {
        var companyId = _userContext.CompanyId ?? 0;
        var orders = _userContext.IsSuperAdmin
            ? await _unitOfWork.Orders.GetAllAsync()
            : await _unitOfWork.Orders.FindAsync(o => o.CompanyId == companyId);
        
        var dtoList = new List<OrderDto>();
        foreach (var order in orders)
        {
            var items = await _unitOfWork.OrderItems.FindAsync(oi => oi.OrderId == order.Id);
            dtoList.Add(MapToDto(order, items));
        }
        return dtoList;
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int id)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var order = (await _unitOfWork.Orders.FindAsync(o => o.Id == id && o.CompanyId == companyId)).FirstOrDefault();
        if (order == null) return null;

        var items = await _unitOfWork.OrderItems.FindAsync(oi => oi.OrderId == order.Id);
        return MapToDto(order, items);
    }

    public async Task<OrderDto?> CreateOrderAsync(CreateOrderDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        
        // 1. Calculate Total Amount
        decimal totalAmount = 0;
        var orderItems = new List<OrderItem>();
        
        foreach (var itemDto in dto.Items)
        {
            var product = (await _unitOfWork.Products.FindAsync(p => p.Id == itemDto.ProductId && p.CompanyId == companyId)).FirstOrDefault();
            if (product == null || (product.Stock ?? 0) < itemDto.Quantity) return null;

            var price = product.Price ?? 0;
            var itemTotal = price * itemDto.Quantity;
            totalAmount += itemTotal;

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                Quantity = itemDto.Quantity,
                Price = price
            });

            // 2. Reduce Stock
            product.Stock -= itemDto.Quantity;
            _unitOfWork.Products.Update(product);

            // 3. Log Inventory Transaction
            await _unitOfWork.InventoryTransactions.AddAsync(new InventoryTransaction
            {
                ProductId = product.Id,
                Type = "OUT",
                ChangeAmount = itemDto.Quantity,
                CreatedAt = DateTime.UtcNow
            });
        }

        // 4. Create Order
        var order = new Order
        {
            CompanyId = companyId,
            CustomerName = dto.CustomerName,
            TotalAmount = totalAmount,
            Status = "InProgress",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _userContext.UserId
        };
        await _unitOfWork.Orders.AddAsync(order);
        await _unitOfWork.CompleteAsync();

        // 5. Add Order Items
        foreach (var item in orderItems)
        {
            item.OrderId = order.Id;
            await _unitOfWork.OrderItems.AddAsync(item);
        }

        // Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            CompanyId = companyId,
            UserId = _userContext.UserId,
            Action = "Create",
            Entity = "Order",
            EntityId = order.Id,
            CreatedAt = DateTime.UtcNow
        });

        await _unitOfWork.CompleteAsync();

        // 6. Enrichment: Fetch product names for DTO
        foreach (var item in orderItems)
        {
            var p = await _unitOfWork.Products.GetByIdAsync(item.ProductId);
            if (p != null) item.Product = p;
        }

        return MapToDto(order, orderItems);
    }

    public async Task<bool> UpdateOrderStatusAsync(int id, string status)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var order = (await _unitOfWork.Orders.FindAsync(o => o.Id == id && o.CompanyId == companyId)).FirstOrDefault();
        if (order == null) return false;

        order.Status = status;
        _unitOfWork.Orders.Update(order);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    private OrderDto MapToDto(Order order, IEnumerable<OrderItem> items)
    {
        return new OrderDto
        {
            Id = order.Id,
            CustomerName = order.CustomerName ?? "",
            TotalAmount = order.TotalAmount ?? 0,
            Status = order.Status ?? "",
            CreatedAt = order.CreatedAt ?? DateTime.UtcNow,
            Items = items.Select(i => new OrderItemDto
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity ?? 0,
                Price = i.Price ?? 0,
                ProductName = i.Product?.Name ?? ("Product " + i.ProductId)
            }).ToList()
        };
    }
}
