namespace QwlRestaurant.Entities.DTOs.Reservation;

public interface IReservationService
{
    Task<ReservationDto> CreateAsync(CreateReservationDto dto, string? userId);
    Task<IEnumerable<ReservationDto>> GetAllAsync();
    Task<ReservationDto> GetByIdAsync(int id);
    Task UpdatesStatusAsync(int id, int status);
    Task DeleteAsync(int id);
    Task<IEnumerable<string>> GetOccupiedTablesAsync(DateTime date, TimeSpan time);
}