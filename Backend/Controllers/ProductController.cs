using Backend.DTOs.Product;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    [Authorize(Policy = "products.view")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _productService.GetAllProductsAsync());
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "products.view")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _productService.GetProductByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "products.create")]
    public async Task<IActionResult> Create(CreateProductDto dto)
    {
        var result = await _productService.CreateProductAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "products.manage")]
    public async Task<IActionResult> Update(int id, UpdateProductDto dto)
    {
        var result = await _productService.UpdateProductAsync(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "products.manage")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _productService.DeleteProductAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/restock")]
    [Authorize(Policy = "products.manage")]
    public async Task<IActionResult> Restock(int id, RestockProductDto dto)
    {
        var result = await _productService.RestockProductAsync(id, dto);
        if (!result) return NotFound();
        return Ok("Product restocked.");
    }
}
