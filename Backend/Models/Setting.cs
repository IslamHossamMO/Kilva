using System;
using System.Collections.Generic;

namespace Backend.Models;

public partial class Setting
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string? Key { get; set; }

    public string? Value { get; set; }

    public virtual Company Company { get; set; } = null!;
}
