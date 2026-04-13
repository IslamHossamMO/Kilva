namespace Backend.DTOs.Auth;

public class RegisterDto
{
    public string CompanyName { get; set; } = null!;
    public string OwnerEmail { get; set; } = null!;
    public string OwnerPassword { get; set; } = null!;
    public string OwnerFullName { get; set; } = null!;
    public string? OwnerPhone { get; set; }
}

public class LoginDto
{
    public string Identifier { get; set; } = null!; // Email or Phone
    public string Password { get; set; } = null!;
}

public class AuthResponseDto
{
    public string Token { get; set; } = null!;
    public UserDto User { get; set; } = null!;
    public string CompanyCurrency { get; set; } = "$";
}

public class UserDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public int CompanyId { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public decimal? Salary { get; set; }
    public string? Position { get; set; }
}

public class UpdateProfileDto
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}
