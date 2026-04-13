using Backend.DTOs.Order;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    [Authorize(Policy = "orders.view")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _orderService.GetAllOrdersAsync());
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "orders.view")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _orderService.GetOrderByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "orders.create")]
    public async Task<IActionResult> Create(CreateOrderDto dto)
    {
        var result = await _orderService.CreateOrderAsync(dto);
        if (result == null) return BadRequest("Order creation failed. Check stock or product availability.");
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}/status")]
    [Authorize(Policy = "orders.manage")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusDto dto)
    {
        var result = await _orderService.UpdateOrderStatusAsync(id, dto.Status);
        if (!result) return NotFound();
        return Ok("Status updated.");
    }
}
