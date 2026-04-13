using Backend.DTOs.Notification;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var notifications = await _notificationService.GetNotificationsAsync();
        return Ok(notifications);
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var result = await _notificationService.MarkAsReadAsync(id);
        if (!result) return NotFound("Notification not found or access denied.");
        return Ok(new { message = "Marked as read successfully" });
    }

    [HttpPost]
    [Authorize(Policy = "settings.edit")]
    public async Task<IActionResult> CreateNotification(CreateNotificationDto dto)
    {
        var created = await _notificationService.CreateNotificationAsync(dto);
        return CreatedAtAction(nameof(GetNotifications), new { id = created.Id }, created);
    }
}
