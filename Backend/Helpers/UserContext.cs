using System.Security.Claims;

namespace Backend.Helpers;

public interface IUserContext
{
    int? UserId { get; }
    int? CompanyId { get; }
    bool IsSuperAdmin { get; }
}

public class UserContext : IUserContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int? UserId
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : null;
        }
    }

    public int? CompanyId
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User.FindFirst("CompanyId");
            return claim != null ? int.Parse(claim.Value) : null;
        }
    }

    public bool IsSuperAdmin
    {
        get
        {
            return _httpContextAccessor.HttpContext?.User.IsInRole("SuperAdmin") ?? false;
        }
    }
}
