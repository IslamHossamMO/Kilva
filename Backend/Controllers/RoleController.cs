using Backend.DTOs.Role;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoleController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RoleController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    [HttpGet]
    [Authorize(Policy = "roles.view")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _roleService.GetAllRolesAsync());
    }

    [HttpPost]
    [Authorize(Policy = "roles.create")]
    public async Task<IActionResult> Create(CreateRoleDto dto)
    {
        var result = await _roleService.CreateRoleAsync(dto);
        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "roles.manage")]
    public async Task<IActionResult> Update(int id, UpdateRoleDto dto)
    {
        var result = await _roleService.UpdateRoleAsync(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "roles.manage")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _roleService.DeleteRoleAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("permissions")]
    [Authorize(Policy = "permissions.view")]
    public async Task<IActionResult> GetPermissions()
    {
        return Ok(await _roleService.GetAllPermissionsAsync());
    }

    [HttpPost("{id}/permissions")]
    [Authorize(Policy = "roles.manage")]
    public async Task<IActionResult> AssignPermissions(int id, AssignPermissionsDto dto)
    {
        var result = await _roleService.AssignPermissionsAsync(id, dto);
        if (!result) return NotFound();
        return Ok("Permissions assigned.");
    }
}
