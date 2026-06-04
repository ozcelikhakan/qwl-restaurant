namespace QwlRestaurant.Entities.DTOs.Event;

public class CreateEventDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string?  ImageUrl { get; set; }
    public DateTime EventDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Location { get; set; }
    public decimal TicketPrice { get; set; }
    public int TotalSlots { get; set; }

}