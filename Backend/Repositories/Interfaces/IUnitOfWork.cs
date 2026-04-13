using Backend.Models;

namespace Backend.Repositories.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<AuditLog> AuditLogs { get; }
    IGenericRepository<Company> Companies { get; }
    IGenericRepository<Delivery> Deliveries { get; }
    IGenericRepository<DeliveryItem> DeliveryItems { get; }
    IGenericRepository<Expense> Expenses { get; }
    IGenericRepository<InventoryTransaction> InventoryTransactions { get; }
    IGenericRepository<Notification> Notifications { get; }
    IGenericRepository<Order> Orders { get; }
    IGenericRepository<OrderItem> OrderItems { get; }
    IGenericRepository<Permission> Permissions { get; }
    IGenericRepository<Product> Products { get; }
    IGenericRepository<Role> Roles { get; }
    IGenericRepository<RolePermission> RolePermissions { get; }
    IGenericRepository<Setting> Settings { get; }
    IGenericRepository<User> Users { get; }
    IGenericRepository<UserRole> UserRoles { get; }
    IGenericRepository<Attendance> Attendances { get; }
    Task<int> CompleteAsync();
}
