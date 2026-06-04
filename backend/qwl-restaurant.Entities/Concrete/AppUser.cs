using Microsoft.AspNetCore.Identity;

namespace QwlRestaurant.Entities.Concrete;

public class AppUser : IdentityUser

{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<EventTicket> EventTickets { get; set; } = new List<EventTicket>();
    public ICollection<Blog> Blogs { get; set; } = new List<Blog>();

}