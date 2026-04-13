namespace Backend.DTOs.Product;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? SKU { get; set; }
    public string? Category { get; set; }
    public string? ImageUrl { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int? MinStock { get; set; }
}

public class CreateProductDto
{
    public string Name { get; set; } = null!;
    public string? SKU { get; set; }
    public string? Category { get; set; }
    public string? ImageUrl { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int? MinStock { get; set; }
}

public class UpdateProductDto
{
    public string? Name { get; set; }
    public string? SKU { get; set; }
    public string? Category { get; set; }
    public string? ImageUrl { get; set; }
    public decimal? Price { get; set; }
    public int? Stock { get; set; }
    public int? MinStock { get; set; }
}

public class RestockProductDto
{
    public int Quantity { get; set; }
}
