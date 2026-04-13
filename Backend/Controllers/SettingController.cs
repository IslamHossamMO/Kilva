using Backend.DTOs.Setting;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SettingController : ControllerBase
{
    private readonly ISettingService _settingService;

    public SettingController(ISettingService settingService)
    {
        _settingService = settingService;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetSettings()
    {
        return Ok(await _settingService.GetSettingsAsync());
    }

    [HttpPut]
    [Authorize(Policy = "settings.manage")]
    public async Task<IActionResult> UpdateSetting(UpdateSettingDto dto)
    {
        await _settingService.UpdateSettingAsync(dto);
        return Ok("Setting updated.");
    }
}
