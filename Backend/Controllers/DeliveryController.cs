using Backend.DTOs.Delivery;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DeliveryController : ControllerBase
{
    private readonly IDeliveryService _deliveryService;

    public DeliveryController(IDeliveryService deliveryService)
    {
        _deliveryService = deliveryService;
    }

    [HttpGet]
    [Authorize(Policy = "deliveries.view")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _deliveryService.GetAllDeliveriesAsync());
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "deliveries.view")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _deliveryService.GetDeliveryByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "deliveries.create")]
    public async Task<IActionResult> Create(CreateDeliveryDto dto)
    {
        var result = await _deliveryService.CreateDeliveryAsync(dto);
        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "deliveries.manage")]
    public async Task<IActionResult> Update(int id, UpdateDeliveryDto dto)
    {
        var result = await _deliveryService.UpdateDeliveryAsync(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut("{id}/status")]
    [Authorize(Policy = "deliveries.manage")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateDeliveryStatusDto dto)
    {
        var result = await _deliveryService.UpdateDeliveryStatusAsync(id, dto.Status);
        if (!result) return NotFound();
        return Ok("Status updated.");
    }
}
