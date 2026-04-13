using Backend.DTOs.Expense;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Backend.Helpers;

namespace Backend.Services.Implementation;

public class ExpenseService : IExpenseService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;

    public ExpenseService(IUnitOfWork unitOfWork, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
    }

    public async Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync()
    {
        var companyId = _userContext.CompanyId ?? 0;
        var expenses = await _unitOfWork.Expenses.FindAsync(e => e.CompanyId == companyId);
        return expenses.Select(e => new ExpenseDto
        {
            Id = e.Id,
            Title = e.Title ?? "No Title",
            Amount = e.Amount,
            Category = e.Category ?? "Uncategorized",
            Date = e.Date
        });
    }

    public async Task<ExpenseDto?> CreateExpenseAsync(CreateExpenseDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var expense = new Expense
        {
            CompanyId = companyId,
            Title = dto.Title,
            Amount = dto.Amount,
            Category = dto.Category,
            Date = dto.Date != default ? dto.Date : DateTime.UtcNow,
            CreatedBy = _userContext.UserId
        };
        await _unitOfWork.Expenses.AddAsync(expense);
        await _unitOfWork.CompleteAsync();

        return new ExpenseDto
        {
            Id = expense.Id,
            Title = expense.Title ?? "",
            Amount = expense.Amount,
            Category = expense.Category ?? "",
            Date = expense.Date
        };
    }

    public async Task<ExpenseDto?> UpdateExpenseAsync(int id, UpdateExpenseDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var expense = (await _unitOfWork.Expenses.FindAsync(e => e.Id == id && e.CompanyId == companyId)).FirstOrDefault();
        if (expense == null) return null;

        if (dto.Title != null) expense.Title = dto.Title;
        if (dto.Amount != null) expense.Amount = dto.Amount.Value;
        if (dto.Category != null) expense.Category = dto.Category;

        _unitOfWork.Expenses.Update(expense);
        await _unitOfWork.CompleteAsync();

        return new ExpenseDto
        {
            Id = expense.Id,
            Title = expense.Title ?? "",
            Amount = expense.Amount,
            Category = expense.Category ?? "",
            Date = expense.Date
        };
    }

    public async Task<bool> DeleteExpenseAsync(int id)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var expense = (await _unitOfWork.Expenses.FindAsync(e => e.Id == id && e.CompanyId == companyId)).FirstOrDefault();
        if (expense == null) return false;

        _unitOfWork.Expenses.Delete(expense);
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
