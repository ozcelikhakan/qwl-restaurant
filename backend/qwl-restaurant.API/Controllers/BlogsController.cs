using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QwlRestaurant.Business.Services.Abstract;
using QwlRestaurant.Entities.DTOs.Blog;

namespace QwlRestaurant.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlogsController : ControllerBase
{
    private readonly IBlogService _service;

    public BlogsController(IBlogService service)
    {
        _service = service;
    }

    // Gets all published blogs for public users
    [HttpGet]
    public async Task<IActionResult> GetPublished() => Ok(await _service.GetPublishedAsync());

    // Gets a single blog detail by its slug
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await _service.GetBySlugAsync(slug);
        return result == null ? NotFound() : Ok(result);
    }

    // Gets all blogs including unpublished ones
    [Authorize]
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    // Gets blogs created by the currently logged-in user
    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        return Ok(await _service.GetByAuthorAsync(authorId));   
    }

    // Creates a new blog post for the currently logged-in user
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBlogDto dto)
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _service.CreateAsync(dto, authorId);
        return Ok(result);
    }

    // Updates an existing blog post
    [Authorize(Roles="Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateBlogDto dto)
        => Ok(await _service.UpdateAsync(id, dto));

    // Publishes an existing blog post
    [Authorize(Roles="Admin")]
    [HttpPut("{id}/publish")]
    public async Task<IActionResult> Publish(int id)
    {
        await _service.PublishAsync(id);
        return NoContent();
    } 

    // Deletes an existing blog post
    [Authorize(Roles="Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    // Adds a new comment to a blog post
    [HttpPost("Comments")]
    public async Task<IActionResult> AddComments([FromBody] CreateCommentDto dto)
    {
        await _service.AddCommentAsync(dto);
        return Ok(new { message = "Your comment waiting for approve"});
    }

    // Gets all pending (unapproved) comments for admin moderation
    [Authorize(Roles="Admin")]
    [HttpGet("comments/pending")]
    public async Task<IActionResult> PendingComments() => Ok(await _service.GetPendingCommentsAsync());

    // Approves a pending blog comment
    [Authorize(Roles="Admin")]
    [HttpPost("comments/{id}/approve")]
    public async Task<IActionResult> ApproveComment(int id)
    {
        await _service.ApproveCommentAsync(id);
        return NoContent();
    }

    // Deletes a blog comment
    [Authorize(Roles="Admin")]
    [HttpDelete("comments/{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        await _service.DeleteCommentAsync(id);
        return NoContent();
    }
}

