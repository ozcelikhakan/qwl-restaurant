namespace QwlRestaurant.Entities.Concrete;

public class BlogComment
{
    public int Id { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string AuthorEmail { get; set; } = string.Empty;
    public string  Content { get; set; } = string.Empty;

    public bool IsApproved { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int BlogId { get; set; }

    public Blog Blog { get; set; } = null!;

}