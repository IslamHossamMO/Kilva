using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class Role
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string Name { get; set; } = null!;

    public virtual Company Company { get; set; } = null!;

    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
