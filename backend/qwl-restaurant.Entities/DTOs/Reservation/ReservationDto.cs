using QwlRestaurant.Entities.Concrete;

namespace QwlRestaurant.Entities.DTOs.Reservation;

public class ReservationDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime ReservationDate { get; set; }
    public TimeSpan ReservationTime { get; set; }
    public int PersonCount { get; set; }
    public string? Message { get; set; }
    public string? TableNumber { get; set; }
    public ReservationStatus Status { get; set; } 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
}