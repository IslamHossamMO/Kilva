using Backend.DTOs.Expense;

namespace Backend.Services.Interfaces;

public interface IExpenseService
{
    Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync();
    Task<ExpenseDto?> CreateExpenseAsync(CreateExpenseDto dto);
    Task<ExpenseDto?> UpdateExpenseAsync(int id, UpdateExpenseDto dto);
    Task<bool> DeleteExpenseAsync(int id);
}
