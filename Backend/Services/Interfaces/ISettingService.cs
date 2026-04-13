using Backend.DTOs.Setting;

namespace Backend.Services.Interfaces;

public interface ISettingService
{
    Task<IEnumerable<SettingDto>> GetSettingsAsync();
    Task<bool> UpdateSettingAsync(UpdateSettingDto dto);
}
