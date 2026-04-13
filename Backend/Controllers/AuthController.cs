using Backend.DTOs.Auth;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);
        if (result == null) return BadRequest("Registration failed.");
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        if (result == null) return Unauthorized("Invalid email or password.");
        return Ok(result);
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _authService.UpdateProfileAsync(userId, dto);
        if (!result) return NotFound();
        return Ok("Profile updated.");
    }

    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _authService.ChangePasswordAsync(userId, dto);
        if (!result) return BadRequest("Invalid current password.");
        return Ok("Password changed.");
    }
}
