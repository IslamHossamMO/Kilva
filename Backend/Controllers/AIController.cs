using Backend.DTOs.AI;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AIController : ControllerBase
{
    private readonly IAIService _aiService;

    public AIController(IAIService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("query")]
    [Authorize(Policy = "ai.query")]
    public async Task<IActionResult> Query(AIQueryDto dto)
    {
        var result = await _aiService.QueryAsync(dto.Question);
        return Ok(new { response = result });
    }
}
