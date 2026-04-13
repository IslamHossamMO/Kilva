using Backend.DTOs.User;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    [Authorize(Policy = "users.view")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _userService.GetAllUsersAsync());
    }

    [HttpPost]
    [Authorize(Policy = "users.create")]
    public async Task<IActionResult> Create(CreateUserDto dto)
    {
        var result = await _userService.CreateUserAsync(dto);
        if (result == null) return BadRequest();
        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "users.manage")]
    public async Task<IActionResult> Update(int id, UpdateUserDto dto)
    {
        var result = await _userService.UpdateUserAsync(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "users.manage")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _userService.DeleteUserAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/roles")]
    [Authorize(Policy = "roles.manage")]
    public async Task<IActionResult> AssignRoles(int id, AssignRolesDto dto)
    {
        var result = await _userService.AssignRolesAsync(id, dto);
        if (!result) return NotFound();
        return Ok("Roles assigned.");
    }
}
