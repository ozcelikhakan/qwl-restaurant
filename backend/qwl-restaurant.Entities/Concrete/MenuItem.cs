namespace QwlRestaurant.Entities.Concrete;

public class MenuItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; } 
    public string? Ingredients { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
    public int MenuCategoryId { get; set; }
    public MenuCategory MenuCategory { get; set; } = null!;


}