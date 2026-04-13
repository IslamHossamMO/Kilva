using Backend.DTOs.Attendance;

namespace Backend.Services.Interfaces;

public interface IAttendanceService
{
    Task<IEnumerable<AttendanceDto>> GetAttendanceByDateAsync(DateTime date);
    Task<IEnumerable<AttendanceSummaryDto>> GetMonthlySalarySummaryAsync(int month, int year);
    Task<AttendanceDto> RecordAttendanceAsync(CreateAttendanceDto dto);
    Task<bool> DeleteAttendanceAsync(int id);
}
