using Backend.DTOs.Company;

namespace Backend.Services.Interfaces;

public interface ICompanyService
{
    Task<CompanyDto?> GetCurrentCompanyAsync();
    Task<CompanyDto?> UpdateCompanyAsync(UpdateCompanyDto dto);
}
