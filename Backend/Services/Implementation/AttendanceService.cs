using Backend.DTOs.Attendance;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Backend.Helpers;

namespace Backend.Services.Implementation;

public class AttendanceService : IAttendanceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;

    public AttendanceService(IUnitOfWork unitOfWork, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
    }

    public async Task<IEnumerable<AttendanceDto>> GetAttendanceByDateAsync(DateTime date)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var attendances = await _unitOfWork.Attendances.FindAsync(
            a => a.CompanyId == companyId && a.Date.Date == date.Date
        );

        var users = await _unitOfWork.Users.FindAsync(u => u.CompanyId == companyId);
        var usersDict = users.ToDictionary(u => u.Id, u => u.FullName);

        return attendances.Select(a => new AttendanceDto
        {
            Id = a.Id,
            UserId = a.UserId,
            UserFullName = usersDict.ContainsKey(a.UserId) ? (usersDict[a.UserId] ?? "Unknown") : "Unknown",
            Date = a.Date,
            IsAbsent = a.IsAbsent,
            DeductionAmount = a.DeductionAmount,
            Note = a.Note,
            CreatedAt = a.CreatedAt
        });
    }

    public async Task<IEnumerable<AttendanceSummaryDto>> GetMonthlySalarySummaryAsync(int month, int year)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var users = await _unitOfWork.Users.FindAsync(u => u.CompanyId == companyId);
        var attendances = await _unitOfWork.Attendances.FindAsync(
            a => a.CompanyId == companyId && a.Date >= startDate && a.Date <= endDate
        );

        var summary = new List<AttendanceSummaryDto>();

        foreach (var user in users)
        {
            var userAttendances = attendances.Where(a => a.UserId == user.Id && a.IsAbsent);
            summary.Add(new AttendanceSummaryDto
            {
                UserId = user.Id,
                UserFullName = user.FullName ?? "Unknown",
                BaseSalary = user.Salary ?? 0,
                TotalAbsences = userAttendances.Count(),
                TotalDeductions = userAttendances.Sum(a => a.DeductionAmount)
            });
        }

        return summary;
    }

    public async Task<AttendanceDto> RecordAttendanceAsync(CreateAttendanceDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        
        // Find user to get salary for deduction calculation
        var user = (await _unitOfWork.Users.FindAsync(u => u.Id == dto.UserId && u.CompanyId == companyId)).FirstOrDefault();
        if (user == null) throw new Exception("User not found");

        decimal deduction = 0;
        if (dto.IsAbsent)
        {
            // Deduction rule: 10% of base salary for each day of absence
            deduction = (user.Salary ?? 0) * 0.10m;
        }

        // Check if attendance already recorded for this user on this date
        var existing = (await _unitOfWork.Attendances.FindAsync(
            a => a.UserId == dto.UserId && a.Date.Date == dto.Date.Date
        )).FirstOrDefault();

        if (existing != null)
        {
            existing.IsAbsent = dto.IsAbsent;
            existing.DeductionAmount = deduction;
            existing.Note = dto.Note;
            _unitOfWork.Attendances.Update(existing);
        }
        else
        {
            existing = new Attendance
            {
                UserId = dto.UserId,
                CompanyId = companyId,
                Date = dto.Date,
                IsAbsent = dto.IsAbsent,
                DeductionAmount = deduction,
                Note = dto.Note,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Attendances.AddAsync(existing);
        }

        await _unitOfWork.CompleteAsync();

        return new AttendanceDto
        {
            Id = existing.Id,
            UserId = existing.UserId,
            UserFullName = user.FullName ?? "Unknown",
            Date = existing.Date,
            IsAbsent = existing.IsAbsent,
            DeductionAmount = existing.DeductionAmount,
            Note = existing.Note,
            CreatedAt = existing.CreatedAt
        };
    }

    public async Task<bool> DeleteAttendanceAsync(int id)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var attendance = (await _unitOfWork.Attendances.FindAsync(a => a.Id == id && a.CompanyId == companyId)).FirstOrDefault();
        if (attendance == null) return false;

        _unitOfWork.Attendances.Delete(attendance);
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
