using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class Notification
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public int? UserId { get; set; } // Null means company-wide

    public string Title { get; set; } = null!;

    public string Message { get; set; } = null!;

    public string? Type { get; set; } // Info, Warning, Success, Error

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Company Company { get; set; } = null!;

    public virtual User? User { get; set; }
}
