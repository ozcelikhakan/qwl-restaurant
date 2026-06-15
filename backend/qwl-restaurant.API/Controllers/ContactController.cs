using System.Diagnostics.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QwlRestaurant.Business.Services.Abstract;
using QwlRestaurant.Entities.DTOs.Contact;
using SQLitePCL;

namespace QwlRestaurant.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly IContactService _service;

    public ContactController(IContactService service)
    {
        _service = service;
    }

    // Sends a new contact message
    [HttpPost]
    public async Task<IActionResult> Send([FromBody] CreateContactMessageDto dto)
    {
        await _service.SendMessageAsync(dto);
        return Ok(new { message = "Your message has been sent successfully"});
    }

    // Gets all contact messages
    [Authorize(Roles="Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    // Marks a contact message as read
    [Authorize(Roles="Admin")]
    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        await _service.MarkAsReadAsync(id);
        return NoContent();
    }

    //Deletes a messages 
    [Authorize(Roles="Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}