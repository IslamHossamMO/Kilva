using Backend.DTOs.Setting;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Backend.Helpers;

namespace Backend.Services.Implementation;

public class SettingService : ISettingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;

    public SettingService(IUnitOfWork unitOfWork, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
    }

    public async Task<IEnumerable<SettingDto>> GetSettingsAsync()
    {
        var companyId = _userContext.CompanyId ?? 0;
        var settings = await _unitOfWork.Settings.FindAsync(s => s.CompanyId == companyId);
        return settings.Select(s => new SettingDto
        {
            Key = s.Key ?? "",
            Value = s.Value ?? ""
        });
    }

    public async Task<bool> UpdateSettingAsync(UpdateSettingDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var setting = (await _unitOfWork.Settings.FindAsync(s => s.CompanyId == companyId && s.Key == dto.Key)).FirstOrDefault();
        
        if (setting == null)
        {
            await _unitOfWork.Settings.AddAsync(new Setting
            {
                CompanyId = companyId,
                Key = dto.Key,
                Value = dto.Value
            });
        }
        else
        {
            setting.Value = dto.Value;
            _unitOfWork.Settings.Update(setting);
        }

        await _unitOfWork.CompleteAsync();
        return true;
    }
}
