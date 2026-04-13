namespace Backend.DTOs.Role;

public class RoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public List<PermissionDto> Permissions { get; set; } = new();
}

public class CreateRoleDto
{
    public string Name { get; set; } = null!;
}

public class UpdateRoleDto
{
    public string? Name { get; set; }
}

public class PermissionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}

public class AssignPermissionsDto
{
    public List<int> PermissionIds { get; set; } = new();
}
