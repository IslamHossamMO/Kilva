using Backend.DTOs.Company;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompanyController : ControllerBase
{
    private readonly ICompanyService _companyService;

    public CompanyController(ICompanyService companyService)
    {
        _companyService = companyService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var result = await _companyService.GetCurrentCompanyAsync();
        if (result == null) return NotFound("Company not found.");
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update(UpdateCompanyDto dto)
    {
        var result = await _companyService.UpdateCompanyAsync(dto);
        if (result == null) return BadRequest("Update failed.");
        return Ok(result);
    }
}
