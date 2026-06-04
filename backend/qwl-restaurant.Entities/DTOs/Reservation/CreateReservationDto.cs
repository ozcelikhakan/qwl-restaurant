namespace QwlRestaurant.Entities.DTOs.Reservation;

public class CreateReservationDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime ReservationDate { get; set; }
    public TimeSpan ReservationTime { get; set; }
    public int PersonCount { get; set; }
    public string? Message { get; set; }
    public string? TableNumber { get; set; }
}