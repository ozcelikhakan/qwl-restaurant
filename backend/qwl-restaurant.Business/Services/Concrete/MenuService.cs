using Microsoft.EntityFrameworkCore;
using QwlRestaurant.Business.Services.Abstract;
using QwlRestaurant.DataAccess.Context;
using QwlRestaurant.Entities.Concrete;
using QwlRestaurant.Entities.DTOs.Menu;

namespace QwlRestaurant.Business.Services.Concrete;

public class MenuService : IMenuService
{
    private readonly AppDbContext _context;

    //Dependency Injection
    public MenuService(AppDbContext context)
    {
        _context = context;
    }
    //Creates a new menu item
    public async Task<MenuItemDto> CreateMenuItemAsync(CreateMenuItemDto dto)
    {
        var item = new MenuItem
        {
            Name = dto.Name,
            Description = dto.Description,
            Ingredients = dto.Ingredients,
            Price = dto.Price,
            ImageUrl = dto.ImageUrl,
            DisplayOrder = dto.DisplayOrder,
            MenuCategoryId = dto.MenuCategoryId
        };

        await _context.MenuItems.AddAsync(item);
        await _context.SaveChangesAsync();

        return await GetMenuItemByIdAsync(item.Id) ?? ToDto(item);
    }
    //Deletes a daily special item by its id
    public async Task DeleteDailySpecialAsync(int id)
    {
        var special = await _context.DailySpecials.FindAsync(id)
         ?? throw new InvalidOperationException("Daily special item not found");

        _context.DailySpecials.Remove(special);
        await _context.SaveChangesAsync();
    }
    //Deletes a menu item by its id
    public async Task DeleteMenuItemAsync(int id)
    {
        var item = await _context.MenuItems.FindAsync(id)
         ?? throw new InvalidOperationException("Menu item not found");

        _context.MenuItems.Remove(item);
        await _context.SaveChangesAsync();
    }

    //Returns all active menu categories ordered by display order
    public async Task<IEnumerable<MenuCategoryDto>> GetCategoriesAsync()
    {
        var cats = await _context.MenuCategories
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();
        return cats.Select(c =>  new MenuCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            DisplayOrder = c.DisplayOrder
        });
    }
    //Returns all active daily special items
    public async Task<IEnumerable<DailySpecialDto>> GetDailySpecialAsync()
    {
        var specials = await _context.DailySpecials
            .Where(d =>d.IsActive)
            .OrderBy(d => d.DisplayOrder)
            .ToListAsync();
        return specials.Select(d => new DailySpecialDto
        {
           Id = d.Id,
           Title = d.Title,
           Description = d.Description,
           Price = d.Price,
           ImageUrl = d.ImageUrl,
           DisplayOrder = d.DisplayOrder 
        });
    }
    //Returns a single new item by its id
    public async Task<MenuItemDto?> GetMenuItemByIdAsync(int id)
    {
        var item = await _context.MenuItems
         .Include(m => m.MenuCategory)
         .FirstOrDefaultAsync(m => m.Id == id);

        return item == null ? null : ToDto(item);
    }
    //Returns active menu items, optionally filtered by category id
    public async Task<IEnumerable<MenuItemDto>> GetMenuItemsAsync(int? categoryId)
    {
        var query = _context.MenuItems
            .Include(m => m.MenuCategory)
            .Where(m => m.IsActive);
        if (categoryId.HasValue)
            query = query.Where(m => m.MenuCategoryId == categoryId.Value);
        
        var items = await query.OrderBy(m => m.DisplayOrder).ToListAsync();
        return items.Select(ToDto);
    }
    //Updates a selected menu item
    public async Task<MenuItemDto> UpdateMenuItemAsync(int id, CreateMenuItemDto dto)
    {
        var item = await _context.MenuItems.FindAsync(id)
            ?? throw new InvalidOperationException("Menu item not found");

        item.Name = dto.Name;
        item.Description = dto.Description;
        item.Ingredients = dto.Ingredients;
        item.Price = dto.Price;
        item.ImageUrl = dto.ImageUrl;
        item.DisplayOrder = dto.DisplayOrder;
        item.MenuCategoryId = dto.MenuCategoryId;

        await _context.SaveChangesAsync();
        return await GetMenuItemByIdAsync(id) ?? ToDto(item);

    }
    //Converts a menuıtem entity to a MenuItemDto
    private static MenuItemDto ToDto(MenuItem m) => new()
    {
        Id = m.Id,
        Name = m.Name,
        Description = m.Description,
        Ingredients = m.Ingredients,
        Price = m.Price,
        ImageUrl = m.ImageUrl,
        DisplayOrder = m.DisplayOrder,
        MenuCategoryId = m.MenuCategoryId,
        CategoryName = m.MenuCategory.Name ?? string.Empty,
        CategorySlug = m.MenuCategory.Slug ?? string.Empty
    };
}