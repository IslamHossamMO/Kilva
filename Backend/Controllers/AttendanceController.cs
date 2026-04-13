using Backend.DTOs.Attendance;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AttendanceController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    [HttpGet("date/{date}")]
    [Authorize(Policy = "attendance.view")]
    public async Task<ActionResult<IEnumerable<AttendanceDto>>> GetByDate(DateTime date)
    {
        var result = await _attendanceService.GetAttendanceByDateAsync(date);
        return Ok(result);
    }

    [HttpGet("summary")]
    [Authorize(Policy = "attendance.view")]
    public async Task<ActionResult<IEnumerable<AttendanceSummaryDto>>> GetMonthlySummary([FromQuery] int month, [FromQuery] int year)
    {
        var result = await _attendanceService.GetMonthlySalarySummaryAsync(month, year);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "attendance.manage")]
    public async Task<ActionResult<AttendanceDto>> RecordAttendance(CreateAttendanceDto dto)
    {
        try
        {
            var result = await _attendanceService.RecordAttendanceAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "attendance.manage")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _attendanceService.DeleteAttendanceAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
