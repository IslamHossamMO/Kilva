using Backend.DTOs.User;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Backend.Helpers;

namespace Backend.Services.Implementation;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(IUnitOfWork unitOfWork, IUserContext userContext, IPasswordHasher passwordHasher)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _passwordHasher = passwordHasher;
    }

    public async Task<IEnumerable<UserInfoDto>> GetAllUsersAsync()
    {
        var companyId = _userContext.CompanyId ?? 0;
        var users = await _unitOfWork.Users.FindAsync(u => u.CompanyId == companyId);
        
        var result = new List<UserInfoDto>();
        foreach (var user in users)
        {
            var userRoles = await _unitOfWork.UserRoles.FindAsync(ur => ur.UserId == user.Id);
            var rIds = userRoles.Select(ur => ur.RoleId).ToList();
            var allRoles = await _unitOfWork.Roles.FindAsync(r => r.CompanyId == companyId);
            var roles = allRoles.Where(r => rIds.Contains(r.Id)).ToList();
            
            result.Add(new UserInfoDto
            {
                Id = user.Id,
                FullName = user.FullName ?? "",
                Email = user.Email ?? "",
                PhoneNumber = user.PhoneNumber,
                CreatedAt = user.CreatedAt,
                Roles = roles.Select(r => r.Name).ToList(),
                Salary = user.Salary,
                Position = user.Position
            });
        }
        return result;
    }

    public async Task<UserInfoDto?> CreateUserAsync(CreateUserDto dto)
    {
        // Check for existing user (globally or within company?) 
        // Usually, email/phone should be unique globally for identity.
        var existingUser = (await _unitOfWork.Users.FindAsync(u => u.Email == dto.Email || u.PhoneNumber == dto.PhoneNumber)).FirstOrDefault();
        if (existingUser != null)
        {
            throw new Exception("A user with this email or phone number already exists.");
        }

        var companyId = _userContext.CompanyId ?? 0;
        var user = new User
        {
            CompanyId = companyId,
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = _passwordHasher.HashPassword(dto.Password),
            PhoneNumber = dto.PhoneNumber,
            Salary = dto.Salary,
            Position = dto.Position,
            CreatedAt = DateTime.UtcNow
        };
        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CompleteAsync();

        foreach (var roleId in dto.RoleIds)
        {
            await _unitOfWork.UserRoles.AddAsync(new UserRole
        {
            UserId = user.Id,
            RoleId = roleId
        });
    }
    await _unitOfWork.CompleteAsync();

    var rIdsForReturn = dto.RoleIds;
    var allRolesForReturn = await _unitOfWork.Roles.FindAsync(r => r.CompanyId == companyId);
    var rolesForReturn = allRolesForReturn.Where(r => rIdsForReturn.Contains(r.Id)).ToList();

    return new UserInfoDto
    {
        Id = user.Id,
        FullName = user.FullName ?? "",
        Email = user.Email ?? "",
        PhoneNumber = user.PhoneNumber,
        CreatedAt = user.CreatedAt,
        Roles = rolesForReturn.Select(r => r.Name).ToList(),
        Salary = user.Salary,
        Position = user.Position
    };
}

    public async Task<UserInfoDto?> UpdateUserAsync(int id, UpdateUserDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var user = (await _unitOfWork.Users.FindAsync(u => u.Id == id && u.CompanyId == companyId)).FirstOrDefault();
        if (user == null) return null;

        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.Email != null) user.Email = dto.Email;
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
        if (dto.Salary != null) user.Salary = dto.Salary;
        if (dto.Position != null) user.Position = dto.Position;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.CompleteAsync();

        var userRoles = await _unitOfWork.UserRoles.FindAsync(ur => ur.UserId == user.Id);
        var rIds = userRoles.Select(ur => ur.RoleId).ToList();
        var allRoles = await _unitOfWork.Roles.FindAsync(r => r.CompanyId == companyId);
        var roles = allRoles.Where(r => rIds.Contains(r.Id)).ToList();

        return new UserInfoDto
        {
            Id = user.Id,
            FullName = user.FullName ?? "",
            Email = user.Email ?? "",
            PhoneNumber = user.PhoneNumber,
            CreatedAt = user.CreatedAt,
            Roles = roles.Select(r => r.Name).ToList(),
            Salary = user.Salary,
            Position = user.Position
        };
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var user = (await _unitOfWork.Users.FindAsync(u => u.Id == id && u.CompanyId == companyId)).FirstOrDefault();
        if (user == null) return false;

        // Delete associated roles first
        var userRoles = await _unitOfWork.UserRoles.FindAsync(ur => ur.UserId == id);
        foreach (var ur in userRoles)
        {
            _unitOfWork.UserRoles.Delete(ur);
        }

        _unitOfWork.Users.Delete(user);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> AssignRolesAsync(int userId, AssignRolesDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var user = (await _unitOfWork.Users.FindAsync(u => u.Id == userId && u.CompanyId == companyId)).FirstOrDefault();
        if (user == null) return false;

        // Remove old roles
        var oldRoles = await _unitOfWork.UserRoles.FindAsync(ur => ur.UserId == userId);
        foreach (var role in oldRoles)
        {
            _unitOfWork.UserRoles.Delete(role);
        }

        // Add new roles
        foreach (var roleId in dto.RoleIds)
        {
            await _unitOfWork.UserRoles.AddAsync(new UserRole
            {
                UserId = userId,
                RoleId = roleId
            });
        }
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
