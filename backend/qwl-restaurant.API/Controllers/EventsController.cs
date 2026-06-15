using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QwlRestaurant.Business.Services.Abstract;
using QwlRestaurant.Entities.DTOs.Event;

namespace QwlRestaurant.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly IEventService _service;

    public EventsController(IEventService service)
    {
        _service = service;
    }

    // Gets all events 
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    //Get a single event by its ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    //Creates a new event
    [Authorize(Roles="Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEventDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    //Updates an existing event
    [Authorize(Roles="Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateEventDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return Ok(result);
    }

    //Deletes an existing event
    [Authorize(Roles="Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Gets tickets owned by the currently logged in user
    /// </summary>
    /// <returns>Only authenticated user can access this endpoint</returns>
    [Authorize]
    [HttpGet("tickets/my")]
    public async Task<IActionResult> MyTickets()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        return Ok(await _service.GetUserTicketsAsync(userId));
    }

}