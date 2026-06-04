namespace QwlRestaurant.Entities.Concrete;

public class EventTicket
{
    public int Id { get; set; }
    public int Quantity { get; set; }

    public decimal TotalPrice { get; set; }
    public TicketStatus Status { get; set; } = TicketStatus.Active;

    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;
    public int EventId { get; set; }
    public Event Event { get; set; } = null!;
    public string AppUserId { get; set; } = string.Empty;
    public AppUser AppUser { get; set; } = null!;

}

public enum TicketStatus
{
    Active= 0,
    Cancelled = 1

}