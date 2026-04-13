using Backend.DTOs.Auth;
using Backend.Helpers;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Services.Implementation;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IConfiguration _configuration;

    public AuthService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        // Check for existing user
        var existingUser = (await _unitOfWork.Users.FindAsync(u => u.Email == dto.OwnerEmail || u.PhoneNumber == dto.OwnerPhone)).FirstOrDefault();
        if (existingUser != null)
        {
            throw new Exception("A user with this email or phone number already exists.");
        }

        // 1. Create Company
        var company = new Company
        {
            Name = dto.CompanyName,
            Email = dto.OwnerEmail,
            CreatedAt = DateTime.UtcNow,
            IsSubscribed = true
        };
        await _unitOfWork.Companies.AddAsync(company);
        await _unitOfWork.CompleteAsync();

        // 2. Create Owner Role
        var ownerRole = new Role
        {
            CompanyId = company.Id,
            Name = "Owner"
        };
        await _unitOfWork.Roles.AddAsync(ownerRole);
        await _unitOfWork.CompleteAsync();

        // 3. Assign all permissions to Owner Role
        var permissions = await _unitOfWork.Permissions.GetAllAsync();
        foreach (var permission in permissions)
        {
            await _unitOfWork.RolePermissions.AddAsync(new RolePermission
            {
                RoleId = ownerRole.Id,
                PermissionId = permission.Id
            });
        }

        // 4. Create Owner User
        var user = new User
        {
            CompanyId = company.Id,
            FullName = dto.OwnerFullName,
            Email = dto.OwnerEmail,
            PhoneNumber = dto.OwnerPhone,
            PasswordHash = _passwordHasher.HashPassword(dto.OwnerPassword),
            CreatedAt = DateTime.UtcNow
        };
        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CompleteAsync();

        // 5. Assign Role to User
        await _unitOfWork.UserRoles.AddAsync(new UserRole
        {
            UserId = user.Id,
            RoleId = ownerRole.Id
        });
        await _unitOfWork.CompleteAsync();

        // 6. Log action
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            CompanyId = company.Id,
            UserId = user.Id,
            Action = "Register",
            Entity = "Auth",
            CreatedAt = DateTime.UtcNow
        });
        await _unitOfWork.CompleteAsync();

        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = (await _unitOfWork.Users.FindAsync(u => u.Email == dto.Identifier || u.PhoneNumber == dto.Identifier)).FirstOrDefault();
        if (user == null || !_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash))
        {
            return null;
        }

        return await GenerateAuthResponse(user);
    }

    public async Task<bool> UpdateProfileAsync(int userId, UpdateProfileDto dto)
    {
        var user = (await _unitOfWork.Users.FindAsync(u => u.Id == userId)).FirstOrDefault();
        if (user == null) return false;

        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.PhoneNumber = dto.PhoneNumber;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = (await _unitOfWork.Users.FindAsync(u => u.Id == userId)).FirstOrDefault();
        if (user == null || !_passwordHasher.VerifyPassword(dto.CurrentPassword, user.PasswordHash))
        {
            return false;
        }

        user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);
        _unitOfWork.Users.Update(user);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    private async Task<AuthResponseDto> GenerateAuthResponse(User user)
    {
        // Get roles and permissions
        var userRoles = await _unitOfWork.UserRoles.FindAsync(ur => ur.UserId == user.Id);
        var roleIds = userRoles.Select(ur => ur.RoleId).ToList();
        
        // Avoid OPENJSON by filtering in-memory
        var allRoles = await _unitOfWork.Roles.FindAsync(r => r.CompanyId == user.CompanyId);
        var roles = allRoles.Where(r => roleIds.Contains(r.Id)).ToList();
        var roleNames = roles.Select(r => r.Name).ToList();

        var allRolePermissions = await _unitOfWork.RolePermissions.GetAllAsync();
        var rolePermissions = allRolePermissions.Where(rp => roleIds.Contains(rp.RoleId)).ToList();
        var permissionIds = rolePermissions.Select(rp => rp.PermissionId).Distinct().ToList();
        
        var allPerms = await _unitOfWork.Permissions.GetAllAsync();
        var permissions = allPerms.Where(p => permissionIds.Contains(p.Id)).ToList();
        var permissionNames = permissions.Select(p => p.Name).ToList();

        var tokenHandler = new JwtSecurityTokenHandler();
        var jwtKey = _configuration["Jwt:Key"] ?? "SUPER_SECRET_KEY_FOR_JWT_TOKEN_MANAGEMENT_SYSTEM_1234567890";
        var key = Encoding.ASCII.GetBytes(jwtKey);
        
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email ?? ""),
            new Claim("CompanyId", user.CompanyId.ToString())
        };

        foreach (var role in roleNames)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
            claims.Add(new Claim("role", role)); // Added for legacy/redundancy support
        }
        foreach (var perm in permissionNames) 
        {
            claims.Add(new Claim("Permission", perm));
            claims.Add(new Claim("permission", perm)); // Added for case-insensitive redundancy
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"]
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        
        var company = await _unitOfWork.Companies.GetByIdAsync(user.CompanyId);

        return new AuthResponseDto
        {
            Token = tokenHandler.WriteToken(token),
            CompanyCurrency = company?.Currency ?? "$",
            User = new UserDto
            {
                Id = user.Id,
                FullName = user.FullName ?? "",
                Email = user.Email ?? "",
                PhoneNumber = user.PhoneNumber,
                CompanyId = user.CompanyId,
                Roles = roleNames,
                Permissions = permissionNames,
                Salary = user.Salary,
                Position = user.Position
            }
        };
    }
}
