namespace Backend.DTOs.User;

public class UserInfoDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public DateTime? CreatedAt { get; set; }
    public List<string> Roles { get; set; } = new();
    public decimal? Salary { get; set; }
    public string? Position { get; set; }
}

public class CreateUserDto
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public List<int> RoleIds { get; set; } = new();
    public decimal? Salary { get; set; }
    public string? Position { get; set; }
}

public class UpdateUserDto
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public decimal? Salary { get; set; }
    public string? Position { get; set; }
}

public class AssignRolesDto
{
    public List<int> RoleIds { get; set; } = new();
}
