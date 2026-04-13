using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Backend.Middleware;

public class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public PermissionRequirement(string permission)
    {
        Permission = permission;
    }
}

public class PermissionHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        if (context.User == null) return Task.CompletedTask;

        // NEW: Check for "Owner" role which should also have all permissions
        if (context.User.IsInRole("SuperAdmin") || 
            context.User.IsInRole("Owner") ||
            context.User.HasClaim(ClaimTypes.Role, "SuperAdmin") ||
            context.User.HasClaim(ClaimTypes.Role, "Owner") ||
            context.User.HasClaim("role", "SuperAdmin") ||
            context.User.HasClaim("role", "Owner"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Search for Permission claims
        var permissions = context.User.FindAll("Permission")
                                    .Concat(context.User.FindAll("permission"))
                                    .Select(c => c.Value)
                                    .ToList();

        if (permissions.Any(p => p.Equals(requirement.Permission, StringComparison.OrdinalIgnoreCase)))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
