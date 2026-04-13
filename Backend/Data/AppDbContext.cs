using System;
using System.Collections.Generic;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<Company> Companies { get; set; }

    public virtual DbSet<Delivery> Deliveries { get; set; }

    public virtual DbSet<DeliveryItem> DeliveryItems { get; set; }

    public virtual DbSet<Expense> Expenses { get; set; }

    public virtual DbSet<InventoryTransaction> InventoryTransactions { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<RolePermission> RolePermissions { get; set; }

    public virtual DbSet<Setting> Settings { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }
    public virtual DbSet<Attendance> Attendances { get; set; }

    // protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //    => optionsBuilder.UseSqlServer("Server=.;Database=CompanyManagement;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__AuditLog__3214EC0799FA11FA");

            entity.Property(e => e.Action).HasMaxLength(255);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Entity).HasMaxLength(100);

            entity.HasOne(d => d.Company).WithMany(p => p.AuditLogs)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__AuditLogs__Compa__00200768");

            entity.HasOne(d => d.User).WithMany(p => p.AuditLogs)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__AuditLogs__UserI__01142BA1");
        });

        modelBuilder.Entity<Company>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Companie__3214EC07E3DF4540");

            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.IsSubscribed).HasDefaultValue(false);
            entity.Property(e => e.Currency).HasMaxLength(10).HasDefaultValue("$");
            entity.Property(e => e.Name).HasMaxLength(255);
        });

        modelBuilder.Entity<Delivery>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Deliveri__3214EC070E552892");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DriverName).HasMaxLength(255);
            entity.Property(e => e.Latitude).HasColumnType("decimal(9, 6)");
            entity.Property(e => e.Longitude).HasColumnType("decimal(9, 6)");
            entity.Property(e => e.RouteName).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(50);

            entity.HasOne(d => d.Company).WithMany(p => p.Deliveries)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Deliverie__Compa__75A278F5");
        });

        modelBuilder.Entity<DeliveryItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Delivery__3214EC0779926EF8");

            entity.HasOne(d => d.Delivery).WithMany(p => p.DeliveryItems)
                .HasForeignKey(d => d.DeliveryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DeliveryI__Deliv__787EE5A0");

            entity.HasOne(d => d.Product).WithMany(p => p.DeliveryItems)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__DeliveryI__Produ__797309D9");
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Expenses__3214EC076E565768");

            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.Date).HasColumnType("datetime");
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.Company).WithMany(p => p.Expenses)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Expenses__Compan__5FB337D6");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Expenses)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Expenses__Create__60A75C0F");
        });

        modelBuilder.Entity<InventoryTransaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Inventor__3214EC070973F66C");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Type).HasMaxLength(50);

            entity.HasOne(d => d.Product).WithMany(p => p.InventoryTransactions)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Inventory__Produ__71D1E811");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Orders__3214EC07B42E9651");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CustomerName).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Company).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Orders__CompanyI__693CA210");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Orders__CreatedB__6A30C649");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__OrderIte__3214EC07FB310F21");

            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderItem__Order__6D0D32F4");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderItem__Produ__6E01572D");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Permissi__3214EC0765CCB2C7");

            entity.HasIndex(e => e.Name, "UQ__Permissi__737584F6348C909D").IsUnique();

            entity.Property(e => e.Name).HasMaxLength(150);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Products__3214EC076515FAF3");

            entity.Property(e => e.MinStock).HasDefaultValue(0);
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.SKU).HasMaxLength(100);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.ImageUrl).IsUnicode(false);
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Stock).HasDefaultValue(0);

            entity.HasOne(d => d.Company).WithMany(p => p.Products)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Products__Compan__656C112C");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Roles__3214EC079A2D74A4");

            entity.Property(e => e.Name).HasMaxLength(100);

            entity.HasOne(d => d.Company).WithMany(p => p.Roles)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Roles__CompanyId__52593CB8");
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RolePerm__3214EC07B6D578E7");

            entity.HasOne(d => d.Permission).WithMany(p => p.RolePermissions)
                .HasForeignKey(d => d.PermissionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__RolePermi__Permi__59063A47");

            entity.HasOne(d => d.Role).WithMany(p => p.RolePermissions)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__RolePermi__RoleI__5812160E");
        });

        modelBuilder.Entity<Setting>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Settings__3214EC079DEB6982");

            entity.Property(e => e.Key).HasMaxLength(100);

            entity.HasOne(d => d.Company).WithMany(p => p.Settings)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Settings__Compan__7C4F7684");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC07B9BE242D");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(255);
            entity.Property(e => e.PhoneNumber).HasMaxLength(50);
            entity.Property(e => e.Salary).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Position).HasMaxLength(100);

            entity.HasOne(d => d.Company).WithMany(p => p.Users)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Users__CompanyId__4F7CD00D");
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__UserRole__3214EC072AADABAC");

            entity.HasOne(d => d.Role).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserRoles__RoleI__5CD6CB2B");

            entity.HasOne(d => d.User).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserRoles__UserI__5BE2A6F2");
        });

        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Date).HasColumnType("datetime");
            entity.Property(e => e.DeductionAmount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())").HasColumnType("datetime");

            entity.HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Company)
                .WithMany()
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
