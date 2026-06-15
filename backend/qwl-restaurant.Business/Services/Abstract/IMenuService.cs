using QwlRestaurant.Entities.DTOs.Menu;

namespace QwlRestaurant.Business.Services.Abstract;

public interface IMenuService
{
    Task<IEnumerable<MenuCategoryDto>> GetCategoriesAsync();
    Task<IEnumerable<MenuItemDto>> GetMenuItemsAsync(int? categoryId);
    Task<MenuItemDto?> GetMenuItemByIdAsync(int id);
    Task<MenuItemDto> CreateMenuItemAsync(CreateMenuItemDto dto);
    Task<MenuItemDto> UpdateMenuItemAsync(int id, CreateMenuItemDto dto);
    Task DeleteMenuItemAsync(int id);
    Task<IEnumerable<DailySpecialDto>> GetDailySpecialAsync();

    Task<DailySpecialDto> CreateDailySpecialAsync(DailySpecialDto dto);
    Task DeleteDailySpecialAsync(int id);

}