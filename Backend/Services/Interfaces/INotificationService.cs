using Backend.DTOs.Notification;

namespace Backend.Services.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetNotificationsAsync();
    Task<bool> MarkAsReadAsync(int id);
    Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto);
}
