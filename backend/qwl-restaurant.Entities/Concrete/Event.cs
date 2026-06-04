namespace QwlRestaurant.Entities.Concrete;

public class Event
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
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<EventTicket> Tickets { get; set; } = new List<EventTicket>();
    
}