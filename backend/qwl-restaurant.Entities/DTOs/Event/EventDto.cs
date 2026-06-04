using System.Security.AccessControl;

namespace QwlRestaurant.Entities.DTOs.Event;

public class EventDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public DateTime EventDate { get; set; }
    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }
    public string? Location { get; set; }
    public decimal TicketPrice { get; set; }
    public int TotalSlots { get; set; }
    public int BookedSlots { get; set; }

    public int AvailableSlots => TotalSlots - BookedSlots;

    public bool IsActive { get; set; }
    public string Status { get; set; } = string.Empty;
}
