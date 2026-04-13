using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Helpers;

public static class DbSeeder
{
    public static async Task SeedPermissions(AppDbContext context)
    {
        var permissionsToSeed = new List<string>
        {
            "users.view", "users.create", "users.manage",
            "roles.view", "roles.create", "roles.manage",
            "permissions.view",
            "products.view", "products.create", "products.manage",
            "orders.view", "orders.create", "orders.manage",
            "expenses.view", "expenses.create", "expenses.manage",
            "deliveries.view", "deliveries.create", "deliveries.manage",
            "dashboard.view", "settings.view", "settings.manage",
            "ai.query", "audit-logs.view",
            "attendance.view", "attendance.create", "attendance.manage"
        };

        var existingPermissions = await context.Permissions.ToListAsync();
        var existingNames = existingPermissions.Select(p => p.Name).ToHashSet();

        bool added = false;
        foreach (var perm in permissionsToSeed)
        {
            if (!existingNames.Contains(perm))
            {
                context.Permissions.Add(new Permission { Name = perm });
                added = true;
            }
        }

        if (added)
        {
            await context.SaveChangesAsync();
            
            // Re-fetch all to get IDs of newly added ones
            var allPermissions = await context.Permissions.Select(p => new { p.Id, p.Name }).ToListAsync();
            var masterRoles = await context.Roles
                .Where(r => r.Name == "Owner" || r.Name == "SuperAdmin")
                .ToListAsync();
            
            foreach (var role in masterRoles)
            {
                var existingRolePermIds = await context.RolePermissions
                    .Where(rp => rp.RoleId == role.Id)
                    .Select(rp => rp.PermissionId)
                    .ToListAsync();
                    
                foreach (var perm in allPermissions)
                {
                    if (!existingRolePermIds.Contains(perm.Id))
                    {
                        try 
                        {
                            context.RolePermissions.Add(new RolePermission 
                            { 
                                RoleId = role.Id, 
                                PermissionId = perm.Id 
                            });
                        }
                        catch (Exception ex)
                        {
                            // Log and continue instead of crashing
                            Console.WriteLine($"[Seeder] Warning: Could not assign permission {perm.Name} to role {role.Name}: {ex.Message}");
                        }
                    }
                }
            }
            try 
            {
                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Seeder] Error saving master roles permissions: {ex.Message}");
            }
        }
    }

    public static async Task SeedSystemAdmin(AppDbContext context, IPasswordHasher passwordHasher)
    {
        // 1. Ensure System Company exists
        var systemCompany = await context.Companies.FirstOrDefaultAsync(c => c.Name == "System Management");
        if (systemCompany == null)
        {
            systemCompany = new Company
            {
                Name = "System Management",
                Email = "system@management.com",
                IsSubscribed = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Companies.Add(systemCompany);
            await context.SaveChangesAsync();
        }

        // 2. Ensure SuperAdmin Role exists for System Company
        var superAdminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "SuperAdmin" && r.CompanyId == systemCompany.Id);
        if (superAdminRole == null)
        {
            superAdminRole = new Role
            {
                Name = "SuperAdmin",
                CompanyId = systemCompany.Id
            };
            context.Roles.Add(superAdminRole);
            await context.SaveChangesAsync();

            // Assign all permissions to SuperAdmin
            var allPermissions = await context.Permissions.ToListAsync();
            foreach (var perm in allPermissions)
            {
                context.RolePermissions.Add(new RolePermission
                {
                    RoleId = superAdminRole.Id,
                    PermissionId = perm.Id
                });
            }
            await context.SaveChangesAsync();
        }

        // 3. Ensure Islam Hossam exists
        var adminEmail = "islam.hossam@system.com";
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
        if (adminUser == null)
        {
            adminUser = new User
            {
                FullName = "Islam Hossam",
                Email = adminEmail,
                PasswordHash = passwordHasher.HashPassword("Admin@123"), // Default password
                CompanyId = systemCompany.Id,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();

            // Link to SuperAdmin Role
            context.UserRoles.Add(new UserRole
            {
                UserId = adminUser.Id,
                RoleId = superAdminRole.Id
            });
            await context.SaveChangesAsync();
        }
    }

    public static async Task SeedAsync(AppDbContext context, IServiceProvider services)
    {        
        var passwordHasher = services.GetRequiredService<IPasswordHasher>();
        await SeedPermissions(context);
        await SeedSystemAdmin(context, passwordHasher);
    }
}
