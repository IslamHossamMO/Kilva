using Backend.DTOs.Notification;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Backend.Helpers;

namespace Backend.Services.Implementation;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;

    public NotificationService(IUnitOfWork unitOfWork, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
    }

    public async Task<IEnumerable<NotificationDto>> GetNotificationsAsync()
    {
        var companyId = _userContext.CompanyId ?? 0;
        var userId = _userContext.UserId;

        var notifications = await _unitOfWork.Notifications.FindAsync(n => 
            n.CompanyId == companyId && 
            (n.UserId == null || n.UserId == userId));

        return notifications.OrderByDescending(n => n.CreatedAt).Select(n => new NotificationDto
        {
            Id = n.Id,
            Title = n.Title,
            Message = n.Message,
            Type = n.Type,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        });
    }

    public async Task<bool> MarkAsReadAsync(int id)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var userId = _userContext.UserId;

        var notif = (await _unitOfWork.Notifications.FindAsync(n => 
            n.Id == id && 
            n.CompanyId == companyId && 
            (n.UserId == null || n.UserId == userId))).FirstOrDefault();

        if (notif == null) return false;

        notif.IsRead = true;
        _unitOfWork.Notifications.Update(notif);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;

        var notif = new Notification
        {
            CompanyId = companyId,
            UserId = dto.UserId,
            Title = dto.Title,
            Message = dto.Message,
            Type = dto.Type ?? "info",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Notifications.AddAsync(notif);
        await _unitOfWork.CompleteAsync();

        return new NotificationDto
        {
            Id = notif.Id,
            Title = notif.Title,
            Message = notif.Message,
            Type = notif.Type,
            IsRead = notif.IsRead,
            CreatedAt = notif.CreatedAt
        };
    }
}
