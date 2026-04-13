using Backend.DTOs.Expense;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpenseController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpenseController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    [Authorize(Policy = "expenses.view")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _expenseService.GetAllExpensesAsync());
    }

    [HttpPost]
    [Authorize(Policy = "expenses.create")]
    public async Task<IActionResult> Create(CreateExpenseDto dto)
    {
        var result = await _expenseService.CreateExpenseAsync(dto);
        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "expenses.manage")]
    public async Task<IActionResult> Update(int id, UpdateExpenseDto dto)
    {
        var result = await _expenseService.UpdateExpenseAsync(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "expenses.manage")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _expenseService.DeleteExpenseAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
