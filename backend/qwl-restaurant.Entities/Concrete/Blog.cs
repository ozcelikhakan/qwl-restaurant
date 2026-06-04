using Microsoft.AspNetCore.Identity;

namespace QwlRestaurant.Entities.Concrete;

public class Blog
{
    public int id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public string? CoverImageUrl { get; set; }

    public string[] Tags { get; set; } = Array.Empty<string>();

    public bool IsPublished { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? PublishedAt { get; set; }

    public string AuthorId { get; set; } = string.Empty;
    public AppUser Author { get; set; } = null!;

    public ICollection<BlogComment> Comments { get; set; } = new List<BlogComment>();
}