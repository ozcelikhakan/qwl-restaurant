using QwlRestaurant.Entities.DTOs.Blog;

namespace QwlRestaurant.Business.Services.Abstract;

// Defines the contract for blog-related operations.
public interface IBlogService
{
    // Gets only the published blog posts.
    Task<IEnumerable<BlogDto>> GetPublishedAsync();

    // Gets all blog posts, including published and unpublished ones.
    Task<IEnumerable<BlogDto>> GetAllAsync();

    // Gets all blog posts written by a specific author.
    Task<IEnumerable<BlogDto>> GetByAuthorAsync(string authorId);

    // Gets the details of a blog post by its unique slug.
    Task<BlogDetailDto?> GetBySlugAsync(string slug);

    // Creates a new blog post for the specified author.
    Task<BlogDto> CreateAsync(CreateBlogDto dto, string authorId);

    // Updates an existing blog post by its ID.
    Task<BlogDto> UpdateAsync(int id, CreateBlogDto dto);

    // Marks a blog post as published.
    Task PublishAsync(int id);

    // Deletes a blog post by its ID.
    Task DeleteAsync(int id);

    // Adds a new comment to a blog post.
    Task AddCommentAsync(CreateCommentDto dto);

    // Gets all pending (unapproved) comments for admin moderation.
    Task<IEnumerable<PendingCommentDto>> GetPendingCommentsAsync();

    // Approves a comment by its ID.
    Task ApproveCommentAsync(int commentId);

    // Deletes a comment by its ID.
    Task DeleteCommentAsync(int commentId);
}