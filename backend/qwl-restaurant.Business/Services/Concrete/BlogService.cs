using Microsoft.EntityFrameworkCore;
using QwlRestaurant.Business.Services.Abstract;
using QwlRestaurant.DataAccess.Context;
using QwlRestaurant.Entities.Concrete;
using QwlRestaurant.Entities.DTOs.Blog;

namespace QwlRestaurant.Business.Services.Concrete;

public class BlogService : IBlogService
{
    private readonly AppDbContext _context;

    //Dependency Injection
    public BlogService(AppDbContext context)
    {
        _context = context;
    }

    // Adds a new comment to a blog post.
    public async Task AddCommentAsync(CreateCommentDto dto)
    {
       
        var comment = new BlogComment
        {
            BlogId = dto.BlogId,
            AuthorName = dto.AuthorName,
            AuthorEmail = dto.AuthorEmail,
            Content = dto.Content
        };

        
        await _context.BlogComments.AddAsync(comment);

  
        await _context.SaveChangesAsync();
    }

    // Gets all pending (unapproved) comments for admin moderation.
    public async Task<IEnumerable<PendingCommentDto>> GetPendingCommentsAsync()
    {
        return await _context.BlogComments
            .Include(c => c.Blog)
            .Where(c => !c.IsApproved)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new PendingCommentDto
            {
                Id = c.Id,
                BlogId = c.BlogId,
                BlogTitle = c.Blog.Title,
                AuthorName = c.AuthorName,
                AuthorEmail = c.AuthorEmail,
                Content = c.Content,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();
    }

    // Approves a blog comment by setting IsApproved to true.
    public async Task ApproveCommentAsync(int commentId)
    {
        
        var comment = await _context.BlogComments.FindAsync(commentId)
            ?? throw new InvalidOperationException("Comment not found");

       
        comment.IsApproved = true;

        
        await _context.SaveChangesAsync();
    }

    // Creates a new blog post.
    public async Task<BlogDto> CreateAsync(CreateBlogDto dto, string authorId)
    {
        // Generate a URL-friendly unique slug from the blog title.
        var slug = GenerateSlug(dto.Title);

        
        var blog = new Blog
        {
            Title = dto.Title,
            Slug = slug,
            Summary = dto.Summary,
            Content = dto.Content,
            CoverImageUrl = dto.CoverImageUrl,
            Tags = dto.Tags,
            AuthorId = authorId
        };

        
        await _context.Blogs.AddAsync(blog);
        await _context.SaveChangesAsync();

        
        var created = await _context.Blogs
            .Include(b => b.Author)
            .FirstAsync(b => b.id == blog.id);

        // Convert the Blog entity to BlogDto and return it.
        return ToDto(created);
    }

    // Deletes a blog post by id.
    public async Task DeleteAsync(int id)
    {
        
        var blog = await _context.Blogs.FindAsync(id)
            ?? throw new InvalidOperationException("Blog not found");

        
        _context.Blogs.Remove(blog);

        await _context.SaveChangesAsync();
    }

    // Deletes a blog comment by id.
    public async Task DeleteCommentAsync(int commentId)
    {
        
        var comment = await _context.BlogComments.FindAsync(commentId)
            ?? throw new InvalidOperationException("Comment not found");

        
        _context.BlogComments.Remove(comment);

       
        await _context.SaveChangesAsync();
    }

    // Gets all blog posts, including unpublished ones.
    public async Task<IEnumerable<BlogDto>> GetAllAsync()
    {
        
        var blogs = await _context.Blogs
            .Include(b => b.Author)
            .Include(b => b.Comments)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        // Convert Blog entities to BlogDto objects.
        return blogs.Select(ToDto);
    }

    // Gets all blog posts created by a specific author.
    public async Task<IEnumerable<BlogDto>> GetByAuthorAsync(string authorId)
    {
        
        var blogs = await _context.Blogs
            .Include(b => b.Author)
            .Include(b => b.Comments)
            .Where(b => b.AuthorId == authorId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        // Convert Blog entities to BlogDto objects.
        return blogs.Select(ToDto);
    }

    // Gets a published blog post by its slug.
    public async Task<BlogDetailDto?> GetBySlugAsync(string slug)
    {
        
        var blog = await _context.Blogs
            .Include(b => b.Author)
            .Include(b => b.Comments.Where(c => c.IsApproved))
            .FirstOrDefaultAsync(b => b.Slug == slug && b.IsPublished);

        // Return null if no published blog is found.
        if (blog == null)
            return null;

        // Convert the Blog entity to a detailed DTO.
        return new BlogDetailDto
        {
            id = blog.id,
            Title = blog.Title,
            Slug = blog.Slug,
            Content = blog.Content,
            CoverImageUrl = blog.CoverImageUrl,
            Tags = blog.Tags,
            PublishedAt = blog.PublishedAt,
            AuthorFullName = $"{blog.Author.FirstName} {blog.Author.LastName}",

            // Convert approved comments to BlogCommentDto objects.
            Comments = blog.Comments.Select(c => new BlogCommentDto
            {
                Id = c.Id,
                AuthorName = c.AuthorName,
                Content = c.Content,
                CreatedAt = c.CreatedAt
            }).ToList()
        };
    }

    // Gets only published blog posts.
    public async Task<IEnumerable<BlogDto>> GetPublishedAsync()
    {
        
        var blogs = await _context.Blogs
            .Include(b => b.Author)
            .Include(b => b.Comments)
            .Where(b => b.IsPublished)
            .OrderByDescending(b => b.PublishedAt)
            .ToListAsync();

        // Convert Blog entities to BlogDto objects.
        return blogs.Select(ToDto);
    }

    // Publishes a blog post.
    public async Task PublishAsync(int id)
    {
        
        var blog = await _context.Blogs.FindAsync(id)
            ?? throw new InvalidOperationException("Blog not found");

        // Mark the blog as published.
        blog.IsPublished = true;

       
        blog.PublishedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    // Updates an existing blog post.
    public async Task<BlogDto> UpdateAsync(int id, CreateBlogDto dto)
    {
        
        var blog = await _context.Blogs
            .Include(b => b.Author)
            .FirstOrDefaultAsync(b => b.id == id)
            ?? throw new InvalidOperationException("Blog not found");

       
        blog.Title = dto.Title;
        blog.Summary = dto.Summary;
        blog.Content = dto.Content;
        blog.CoverImageUrl = dto.CoverImageUrl;
        blog.Tags = dto.Tags;


        await _context.SaveChangesAsync();

        // Convert updated Blog entity to BlogDto.
        return ToDto(blog);
    }

    // Converts a Blog entity to a BlogDto.
    private static BlogDto ToDto(Blog b) => new()
    {
        id = b.id,
        Title = b.Title,
        Slug = b.Slug,
        Summary = b.Summary,
        CoverImageUrl = b.CoverImageUrl,
        Tags = b.Tags,
        PublishedAt = b.PublishedAt,

        // Author may be null if it was not included in the query.
        AuthorFullName = $"{b.Author?.FirstName} {b.Author?.LastName}".Trim(),

        // Count only approved comments.
        CommentCount = b.Comments?.Count(c => c.IsApproved) ?? 0
    };

    // Generates a URL-friendly slug from a blog title.
    private static string GenerateSlug(string title)
    {
        // Convert title to lowercase.
        var slug = title.ToLowerInvariant();

        // Replace Turkish characters with English equivalents.
        slug = slug
            .Replace("ş", "s")
            .Replace("ğ", "g")
            .Replace("ü", "u")
            .Replace("ö", "o")
            .Replace("ç", "c")
            .Replace("ı", "i");

        // Replace spaces with hyphens.
        slug = slug.Replace(" ", "-");

        // Remove all characters except lowercase letters, numbers and hyphens.
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\-]", "");

        // Replace multiple hyphens with a single hyphen.
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-");

        // Remove leading and trailing hyphens.
        slug = slug.Trim('-');

        // Add timestamp to make the slug unique.
        return $"{slug}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
    }
}