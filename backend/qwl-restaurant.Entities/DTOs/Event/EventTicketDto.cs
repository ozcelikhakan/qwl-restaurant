using System.Security.AccessControl;

namespace QwlRestaurant.Entities.DTOs.Event;

public class EventTicketDto
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public string EventTitle { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;

    public DateTime PurchasedAt { get; set; }
}