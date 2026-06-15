using System.Reflection.Metadata.Ecma335;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QwlRestaurant.Business.Services.Abstract;
using QwlRestaurant.Entities.DTOs.Menu;

namespace QwlRestaurant.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly IMenuService _service;

    public MenuController(IMenuService service)
    {
        _service = service;
    }

    // Gets all menu categories
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories() => Ok(await _service.GetCategoriesAsync());

    // Gets menu items, optionally filtered by category ID
   [HttpGet("items")]
   public async Task<IActionResult> GetItems([FromQuery] int? categoryId)
     => Ok(await _service.GetMenuItemsAsync(categoryId));

    // Gets a single menu item by its ID
    [HttpGet("items/{id}")]    
    public async Task<IActionResult> GetItemByIdAsync(int id)
    {
        var result = await _service.GetMenuItemByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Creates a new menu item
    /// </summary>
    /// <param name="dto"></param>
    /// <returns>Only users with the Admin role can access this endpoint</returns>
    [Authorize(Roles="Admin")]
    [HttpPost("items")]
    public async Task<IActionResult> CreateItem([FromBody] CreateMenuItemDto dto)
    {
        var result = await _service.CreateMenuItemAsync(dto);
        return CreatedAtAction(nameof(GetItemByIdAsync), new { id = result.Id}, result );
    }

    //Updates an existing menu item by its ID
    [Authorize(Roles="Admin")]
    [HttpPut("items/{id}")]
    public async Task<IActionResult> UpdateItem(int id, [FromBody] CreateMenuItemDto dto)
        => Ok(await _service.UpdateMenuItemAsync(id, dto));

    //Deletes an existing menu item by its ID
    [Authorize(Roles="Admin")]
    [HttpDelete("items/{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        await _service.DeleteMenuItemAsync(id);
        return NoContent();
    }

    // Gets the daily special menu items
    [HttpGet("daily-specials")]
    public async Task<IActionResult> GetDailySpecials() => Ok(await _service.GetDailySpecialAsync());

    // Creates a new daily special item
    [Authorize(Roles="Admin")]
    [HttpPost("daily-specials")]
    public async Task<IActionResult> CreateDailySpecial([FromBody] DailySpecialDto dto)
        =>  Ok(await _service.CreateDailySpecialAsync(dto));

      
    // Deletes a daily special item by its ID
    [Authorize(Roles="Admin")]
    [HttpDelete("daily-specials/{id}")]
    public async Task<IActionResult> DeleteDailySpecial(int id)
    {
        await _service.DeleteDailySpecialAsync(id);
        return NoContent();
    }

    
}