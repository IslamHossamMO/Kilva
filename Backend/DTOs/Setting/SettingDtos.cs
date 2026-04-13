namespace Backend.DTOs.Setting;

public class SettingDto
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
}

public class UpdateSettingDto
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
}
