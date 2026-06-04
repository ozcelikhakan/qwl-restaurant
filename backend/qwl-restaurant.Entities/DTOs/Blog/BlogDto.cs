namespace QwlRestaurant.Entities.DTOs.Blog;

public class BlogDto
{
    public int id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string[] Tags { get; set; } = Array.Empty<string>();

    public DateTime? PublishedAt { get; set; }

    public string AuthorFullName { get; set; } = string.Empty;

    public int CommentCount { get; set; }

}