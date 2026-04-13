using Backend.DTOs.Product;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Backend.Helpers;

namespace Backend.Services.Implementation;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;

    public ProductService(IUnitOfWork unitOfWork, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        var companyId = _userContext.CompanyId ?? 0;
        var products = _userContext.IsSuperAdmin 
            ? await _unitOfWork.Products.GetAllAsync()
            : await _unitOfWork.Products.FindAsync(p => p.CompanyId == companyId);

        return products.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name ?? "Unknown",
            SKU = p.SKU,
            Category = p.Category,
            ImageUrl = p.ImageUrl,
            Price = p.Price ?? 0,
            Stock = p.Stock ?? 0,
            MinStock = p.MinStock
        });
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var product = (await _unitOfWork.Products.FindAsync(p => p.Id == id && p.CompanyId == companyId)).FirstOrDefault();
        if (product == null) return null;

        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name ?? "Unknown",
            SKU = product.SKU,
            Category = product.Category,
            ImageUrl = product.ImageUrl,
            Price = product.Price ?? 0,
            Stock = product.Stock ?? 0,
            MinStock = product.MinStock
        };
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var product = new Product
        {
            CompanyId = companyId,
            Name = dto.Name,
            SKU = dto.SKU,
            Category = dto.Category,
            ImageUrl = dto.ImageUrl,
            Price = dto.Price,
            Stock = dto.Stock,
            MinStock = dto.MinStock
        };

        await _unitOfWork.Products.AddAsync(product);
        await _unitOfWork.CompleteAsync();

        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            SKU = product.SKU,
            Category = product.Category,
            ImageUrl = product.ImageUrl,
            Price = product.Price ?? 0,
            Stock = product.Stock ?? 0,
            MinStock = product.MinStock
        };
    }

    public async Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var product = (await _unitOfWork.Products.FindAsync(p => p.Id == id && p.CompanyId == companyId)).FirstOrDefault();
        if (product == null) return null;

        if (dto.Name != null) product.Name = dto.Name;
        if (dto.SKU != null) product.SKU = dto.SKU;
        if (dto.Category != null) product.Category = dto.Category;
        if (dto.ImageUrl != null) product.ImageUrl = dto.ImageUrl;
        if (dto.Price != null) product.Price = dto.Price.Value;
        if (dto.Stock != null) product.Stock = dto.Stock.Value;
        if (dto.MinStock != null) product.MinStock = dto.MinStock;

        _unitOfWork.Products.Update(product);
        await _unitOfWork.CompleteAsync();

        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name ?? "Unknown",
            SKU = product.SKU,
            Category = product.Category,
            ImageUrl = product.ImageUrl,
            Price = product.Price ?? 0,
            Stock = product.Stock ?? 0,
            MinStock = product.MinStock
        };
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var product = (await _unitOfWork.Products.FindAsync(p => p.Id == id && p.CompanyId == companyId)).FirstOrDefault();
        if (product == null) return false;

        // Delete related transactions first
        var transactions = await _unitOfWork.InventoryTransactions.FindAsync(t => t.ProductId == id);
        foreach (var t in transactions) _unitOfWork.InventoryTransactions.Delete(t);

        // Delete related order items
        var orderItems = await _unitOfWork.OrderItems.FindAsync(oi => oi.ProductId == id);
        foreach (var oi in orderItems) _unitOfWork.OrderItems.Delete(oi);

        _unitOfWork.Products.Delete(product);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> RestockProductAsync(int id, RestockProductDto dto)
    {
        var companyId = _userContext.CompanyId ?? 0;
        var product = (await _unitOfWork.Products.FindAsync(p => p.Id == id && p.CompanyId == companyId)).FirstOrDefault();
        if (product == null) return false;

        product.Stock = (product.Stock ?? 0) + dto.Quantity;
        _unitOfWork.Products.Update(product);

        await _unitOfWork.InventoryTransactions.AddAsync(new InventoryTransaction
        {
            ProductId = id,
            Type = "IN",
            ChangeAmount = dto.Quantity,
            CreatedAt = DateTime.UtcNow
        });

        await _unitOfWork.CompleteAsync();
        return true;
    }
}
