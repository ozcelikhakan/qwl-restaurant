using System.Runtime.CompilerServices;
using QwlRestaurant.Entities.DTOs.Event;

namespace QwlRestaurant.Business.Services.Abstract;

public interface IEventService
{
    Task<IEnumerable<EventDto>> GetAllAsync();
    Task<EventDto?> GetByIdAsync(int id);
    Task<EventDto> CreateAsync(CreateEventDto dto);
    Task<EventDto> UpdateAsync(int id, CreateEventDto dto);
    Task DeleteAsync(int id);
    Task<EventTicketDto> BuyTicketAsync(BuyTicketDto dto, string userId);
    Task<IEnumerable<EventTicketDto>> GetUserTicketsAsync(string userıd);

}