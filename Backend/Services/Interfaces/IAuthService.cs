using Backend.DTOs.Auth;

namespace Backend.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<bool> UpdateProfileAsync(int userId, UpdateProfileDto dto);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto);
}
