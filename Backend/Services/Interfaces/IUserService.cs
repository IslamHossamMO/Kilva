using Backend.DTOs.User;

namespace Backend.Services.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserInfoDto>> GetAllUsersAsync();
    Task<UserInfoDto?> CreateUserAsync(CreateUserDto dto);
    Task<UserInfoDto?> UpdateUserAsync(int id, UpdateUserDto dto);
    Task<bool> DeleteUserAsync(int id);
    Task<bool> AssignRolesAsync(int userId, AssignRolesDto dto);
}
