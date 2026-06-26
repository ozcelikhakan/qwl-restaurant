namespace QwlRestaurant.Entities.DTOs.Blog;

// Represents a pending (unapproved) blog comment shown to admins for moderation.
public class PendingCommentDto
{
    public int Id { get; set; }
    public int BlogId { get; set; }
    public string BlogTitle { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public string AuthorEmail { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
