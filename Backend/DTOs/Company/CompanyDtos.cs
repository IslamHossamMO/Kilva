namespace Backend.DTOs.Company;

public class CompanyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public bool IsSubscribed { get; set; }
    public string? Currency { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateCompanyDto
{
    public string Name { get; set; } = null!;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public bool? IsSubscribed { get; set; }
    public string? Currency { get; set; }
}
