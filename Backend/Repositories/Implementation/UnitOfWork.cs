using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;

namespace Backend.Repositories.Implementation;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IGenericRepository<AuditLog>? _auditLogs;
    private IGenericRepository<Company>? _companies;
    private IGenericRepository<Delivery>? _deliveries;
    private IGenericRepository<DeliveryItem>? _deliveryItems;
    private IGenericRepository<Expense>? _expenses;
    private IGenericRepository<InventoryTransaction>? _inventoryTransactions;
    private IGenericRepository<Notification>? _notifications;
    private IGenericRepository<Order>? _orders;
    private IGenericRepository<OrderItem>? _orderItems;
    private IGenericRepository<Permission>? _permissions;
    private IGenericRepository<Product>? _products;
    private IGenericRepository<Role>? _roles;
    private IGenericRepository<RolePermission>? _rolePermissions;
    private IGenericRepository<Setting>? _settings;
    private IGenericRepository<User>? _users;
    private IGenericRepository<UserRole>? _userRoles;
    private IGenericRepository<Attendance>? _attendances;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public IGenericRepository<AuditLog> AuditLogs => _auditLogs ??= new GenericRepository<AuditLog>(_context);
    public IGenericRepository<Company> Companies => _companies ??= new GenericRepository<Company>(_context);
    public IGenericRepository<Delivery> Deliveries => _deliveries ??= new GenericRepository<Delivery>(_context);
    public IGenericRepository<DeliveryItem> DeliveryItems => _deliveryItems ??= new GenericRepository<DeliveryItem>(_context);
    public IGenericRepository<Expense> Expenses => _expenses ??= new GenericRepository<Expense>(_context);
    public IGenericRepository<InventoryTransaction> InventoryTransactions => _inventoryTransactions ??= new GenericRepository<InventoryTransaction>(_context);
    public IGenericRepository<Notification> Notifications => _notifications ??= new GenericRepository<Notification>(_context);
    public IGenericRepository<Order> Orders => _orders ??= new GenericRepository<Order>(_context);
    public IGenericRepository<OrderItem> OrderItems => _orderItems ??= new GenericRepository<OrderItem>(_context);
    public IGenericRepository<Permission> Permissions => _permissions ??= new GenericRepository<Permission>(_context);
    public IGenericRepository<Product> Products => _products ??= new GenericRepository<Product>(_context);
    public IGenericRepository<Role> Roles => _roles ??= new GenericRepository<Role>(_context);
    public IGenericRepository<RolePermission> RolePermissions => _rolePermissions ??= new GenericRepository<RolePermission>(_context);
    public IGenericRepository<Setting> Settings => _settings ??= new GenericRepository<Setting>(_context);
    public IGenericRepository<User> Users => _users ??= new GenericRepository<User>(_context);
    public IGenericRepository<UserRole> UserRoles => _userRoles ??= new GenericRepository<UserRole>(_context);
    public IGenericRepository<Attendance> Attendances => _attendances ??= new GenericRepository<Attendance>(_context);

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
