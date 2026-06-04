namespace QwlRestaurant.Entities.DTOs.Menu;

public class CreateMenuItemDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; } 
    public string? Ingredients { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public int DisplayOrder { get; set; }
    public int MenuCategoryId { get; set; }
}