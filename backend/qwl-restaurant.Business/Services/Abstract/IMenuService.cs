using QwlRestaurant.Entities.DTOs.Menu;

namespace QwlRestaurant.Business.Services.Abstract;

public interface IMenuService
{
    Task<IEnumerable<MenuCategoryDto>> GetCategoriesAsync();
    Task<IEnumerable<MenuItemDto>> GetMenuItemsAsync(int? categoryId);
    
}