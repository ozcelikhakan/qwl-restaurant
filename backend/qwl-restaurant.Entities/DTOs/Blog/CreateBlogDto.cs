namespace QwlRestaurant.Entities.DTOs.Blog;

public class CreateBlogDto
{
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }

    public string[] Tags { get; set; } = Array.Empty<string>();

}