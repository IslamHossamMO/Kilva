using Backend.DTOs.Company;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Backend.Helpers;

namespace Backend.Services.Implementation;

public class CompanyService : ICompanyService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;

    public CompanyService(IUnitOfWork unitOfWork, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
    }

    public async Task<CompanyDto?> GetCurrentCompanyAsync()
    {
        var companyId = _userContext.CompanyId ?? 0;
        var company = await _unitOfWork.Companies.GetByIdAsync(companyId);
        if (company == null) return null;

        return new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Email = company.Email,
            Address = company.Address,
            IsSubscribed = company.IsSubscribed ?? false,
            Currency = company.Currency ?? "$",
            CreatedAt = company.CreatedAt ?? DateTime.UtcNow
        };
    }

    public async Task<CompanyDto?> UpdateCompanyAsync(UpdateCompanyDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var company = await _unitOfWork.Companies.GetByIdAsync(companyId);
        if (company == null) return null;

        if (dto.Name != null) company.Name = dto.Name;
        if (dto.Email != null) company.Email = dto.Email;
        if (dto.Address != null) company.Address = dto.Address;
        if (dto.IsSubscribed != null) company.IsSubscribed = dto.IsSubscribed.Value;
        if (dto.Currency != null) company.Currency = dto.Currency;

        _unitOfWork.Companies.Update(company);
        await _unitOfWork.CompleteAsync();

        return new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Email = company.Email,
            Address = company.Address,
            IsSubscribed = company.IsSubscribed ?? false,
            Currency = company.Currency ?? "$",
            CreatedAt = company.CreatedAt ?? DateTime.UtcNow
        };
    }
}
