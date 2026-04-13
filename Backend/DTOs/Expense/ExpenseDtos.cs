namespace Backend.DTOs.Expense;

public class ExpenseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Category { get; set; } = null!;
    public DateTime Date { get; set; }
}

public class CreateExpenseDto
{
    public string Title { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Category { get; set; } = null!;
    public DateTime Date { get; set; }
}

public class UpdateExpenseDto
{
    public string? Title { get; set; }
    public decimal? Amount { get; set; }
    public string? Category { get; set; }
}
