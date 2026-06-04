namespace QwlRestaurant.Entities.DTOs.Blog;

public class CreateCommentDto
{
    public int BlogId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string AuthorEmail { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

}