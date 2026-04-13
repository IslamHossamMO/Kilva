using Backend.DTOs.Role;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Backend.Helpers;

namespace Backend.Services.Implementation;

public class RoleService : IRoleService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;

    public RoleService(IUnitOfWork unitOfWork, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
    }

    public async Task<IEnumerable<RoleDto>> GetAllRolesAsync()
    {
        var companyId = _userContext.CompanyId ?? 0;
        var roles = await _unitOfWork.Roles.FindAsync(r => r.CompanyId == companyId);
        
        var dtoList = new List<RoleDto>();
        foreach (var role in roles)
        {
            var rolePermissions = await _unitOfWork.RolePermissions.FindAsync(rp => rp.RoleId == role.Id);
            var perIds = rolePermissions.Select(rp => rp.PermissionId).ToList();
            
            // Avoid OPENJSON by fetching all and filtering in-memory (safe for small permission set)
            var allPerms = await _unitOfWork.Permissions.GetAllAsync();
            var permissions = allPerms.Where(p => perIds.Contains(p.Id)).ToList();

            dtoList.Add(new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Permissions = permissions.Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Name = p.Name
                }).ToList()
            });
        }
        return dtoList;
    }

    public async Task<RoleDto?> CreateRoleAsync(CreateRoleDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var role = new Role
        {
            CompanyId = companyId,
            Name = dto.Name
        };
        await _unitOfWork.Roles.AddAsync(role);
        await _unitOfWork.CompleteAsync();

        return new RoleDto
        {
            Id = role.Id,
            Name = role.Name
        };
    }

    public async Task<RoleDto?> UpdateRoleAsync(int id, UpdateRoleDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var role = (await _unitOfWork.Roles.FindAsync(r => r.Id == id && r.CompanyId == companyId)).FirstOrDefault();
        if (role == null) return null;

        if (dto.Name != null) role.Name = dto.Name;

        _unitOfWork.Roles.Update(role);
        await _unitOfWork.CompleteAsync();

        return new RoleDto
        {
            Id = role.Id,
            Name = role.Name
        };
    }

    public async Task<bool> DeleteRoleAsync(int id)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var role = (await _unitOfWork.Roles.FindAsync(r => r.Id == id && r.CompanyId == companyId)).FirstOrDefault();
        if (role == null) return false;

        // Delete related RolePermissions
        var rolePermissions = await _unitOfWork.RolePermissions.FindAsync(rp => rp.RoleId == id);
        foreach (var rp in rolePermissions) _unitOfWork.RolePermissions.Delete(rp);

        // Delete related UserRoles
        var userRoles = await _unitOfWork.UserRoles.FindAsync(ur => ur.RoleId == id);
        foreach (var ur in userRoles) _unitOfWork.UserRoles.Delete(ur);

        _unitOfWork.Roles.Delete(role);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<IEnumerable<PermissionDto>> GetAllPermissionsAsync()
    {
        var permissions = await _unitOfWork.Permissions.GetAllAsync();
        return permissions.Select(p => new PermissionDto
        {
            Id = p.Id,
            Name = p.Name
        });
    }

    public async Task<bool> AssignPermissionsAsync(int roleId, AssignPermissionsDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var role = (await _unitOfWork.Roles.FindAsync(r => r.Id == roleId && r.CompanyId == companyId)).FirstOrDefault();
        if (role == null) return false;

        // Remove old permissions
        var oldRolePermissions = await _unitOfWork.RolePermissions.FindAsync(rp => rp.RoleId == roleId);
        foreach (var rp in oldRolePermissions)
        {
            _unitOfWork.RolePermissions.Delete(rp);
        }

        // Add new permissions
        foreach (var permId in dto.PermissionIds)
        {
            await _unitOfWork.RolePermissions.AddAsync(new RolePermission
            {
                RoleId = roleId,
                PermissionId = permId
            });
        }
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
