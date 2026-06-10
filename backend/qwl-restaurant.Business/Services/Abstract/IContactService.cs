using  QwlRestaurant.Entities.DTOs.Contact;
using  QwlRestaurant.Entities.Concrete;

namespace QwlRestaurant.Business.Services.Abstract;

public interface IContactService
{
    Task SendMessageAsync(CreateContactMessageDto dto);
    Task<IEnumerable<ContactMessage>> GetAllAsync();
    Task MarkAsReadAsync(int id);
    Task DeleteAsync(int id);
}