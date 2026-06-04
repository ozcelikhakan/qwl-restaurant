namespace QwlRestaurant.Entities.DTOs.Menu;

public class DailySpecialDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }

    public int DisplayOrder { get; set; }
}