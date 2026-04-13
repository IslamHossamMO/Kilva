using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class AuditLog
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public int? UserId { get; set; }

    public string? Action { get; set; }

    public string? Entity { get; set; }

    public int? EntityId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Company Company { get; set; } = null!;

    public virtual User? User { get; set; }
}
