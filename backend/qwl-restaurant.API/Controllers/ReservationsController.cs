
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QwlRestaurant.Entities.DTOs.Reservation;

namespace QwlRestaurant.API.Controllers;


[ApiController]
[Route("api/[controller]")]
public class ReservationController : ControllerBase
{
    private readonly IReservationService _service;

    public ReservationController(IReservationService service)
    {
        _service = service;
    }

     // Creates a new reservation
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReservationDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _service.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id= result.Id}, result);
    } 

    // Gets all reservations
    [Authorize(Roles="Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    // Gets a single reservation by its ID
    [Authorize(Roles="Admin")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }


    // Updates the status of a reservation by its ID
    [Authorize(Roles="Admin")]
    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] int status)
    {
        await _service.UpdatesStatusAsync(id, status);
        return NoContent();
    }

    // Deletes a reservation by its ID
    [Authorize(Roles="Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    // Gets the occupied tables for a specific reservation date and time
    [HttpGet("occupied")]
    public async Task<IActionResult> GetOccupied([FromQuery] string date, [FromQuery] string time)
    {
        if (!DateTime.TryParse(date, out var dateObj)) return BadRequest("Invalid date");
        if (!TimeSpan.TryParse(time, out var timeObj)) return BadRequest("Invalid time");
        var result = await _service.GetOccupiedTablesAsync(dateObj, timeObj);
        return Ok(result);
    }

}

