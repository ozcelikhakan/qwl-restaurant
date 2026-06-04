namespace QwlRestaurant.Entities.Concrete;

public class Reservation
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
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? AppUserId { get; set; }
    public AppUser? AppUser { get; set; }
}

public enum ReservationStatus
{
    Pending = 0,
    Confirmed = 1,
    Cancelled = 2
}