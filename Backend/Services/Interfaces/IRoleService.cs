using Backend.DTOs.Role;

namespace Backend.Services.Interfaces;

public interface IRoleService
{
    Task<IEnumerable<RoleDto>> GetAllRolesAsync();
    Task<RoleDto?> CreateRoleAsync(CreateRoleDto dto);
    Task<RoleDto?> UpdateRoleAsync(int id, UpdateRoleDto dto);
    Task<bool> DeleteRoleAsync(int id);
    Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync();
    Task<bool> AssignPermissionsAsync(int roleId, AssignPermissionsDto dto);
}
