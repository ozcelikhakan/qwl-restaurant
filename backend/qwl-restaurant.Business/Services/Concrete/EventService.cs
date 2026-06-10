using System.Dynamic;
using System.IO.Compression;
using System.Runtime.InteropServices;
using System.Xml;
using Microsoft.EntityFrameworkCore;
using QwlRestaurant.Business.Services.Abstract;
using QwlRestaurant.DataAccess.Context;
using QwlRestaurant.Entities.Concrete;
using QwlRestaurant.Entities.DTOs.Event;

namespace QwlRestaurant.Business.Services.Concrete;

public class EventService : IEventService
{

    private readonly AppDbContext _context;

    //Dependency Injection
    public EventService(AppDbContext context)
    {
        _context = context;
    }

    //Handles ticket purchasing for a specific event
    public async Task<EventTicketDto> BuyTicketAsync(BuyTicketDto dto, string userId)
    {
        var ev = await _context.Events.FindAsync(dto.EventId)
            ?? throw new InvalidOperationException("Event not found");

        if(ev.BookedSlots + dto.Quantity > ev.TotalSlots)
            throw new InvalidOperationException("There is not enough capacity");

        var ticket = new EventTicket
        {
            EventId = dto.EventId,
            AppUserId = userId,
            Quantity = dto.Quantity,
            TotalPrice = ev.TicketPrice * dto.Quantity
        
        };

        ev.BookedSlots += dto.Quantity;

        await _context.EventTickets.AddAsync(ticket);
        await _context.SaveChangesAsync();

        return new EventTicketDto
        {
            Id = ticket.Id,
            EventId = ev.Id,
            EventTitle = ev.Title,
            EventDate = ev.EventDate,
            Quantity = ticket.Quantity,
            TotalPrice = ticket.TotalPrice,
            Status = ticket.Status.ToString(),
            PurchasedAt = ticket.PurchasedAt
        };

    }

    //Creates a new event
    public async Task<EventDto> CreateAsync(CreateEventDto dto)
    {
        var ev = new Event
        {
            Title = dto.Title,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            EventDate = dto.EventDate,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Location = dto.Location,
            TicketPrice = dto.TicketPrice,
            TotalSlots = dto.TotalSlots
        };

        await _context.Events.AddAsync(ev);
        await _context.SaveChangesAsync();
        return ToDto(ev);
    }

    //Deletes an event by its ID
    public async Task DeleteAsync(int id)
    {
        var ev = await _context.Events.FindAsync(id)
            ?? throw new InvalidOperationException ("Message not found");

        _context.Events.Remove(ev);
        await _context.SaveChangesAsync();
    }

    //Return all events 
    public async Task<IEnumerable<EventDto>> GetAllAsync()
    {
        var events = await _context.Events.OrderBy(e => e.EventDate).ToListAsync();
        return events.Select(ToDto);
    }

    //Get a single event by ID
    public async Task<EventDto?> GetByIdAsync(int id)
    {
        var ev = await _context.Events.FindAsync(id);
        return ev == null ? null : ToDto(ev);
    }

    //Returns all tickets purchased by a specific user
    public async Task<IEnumerable<EventTicketDto>> GetUserTicketsAsync(string userıd)
    {
        var tickets = await _context.EventTickets
            .Include(t => t.Event)
            .Where(t => t.AppUserId == userıd)
            .OrderByDescending(t => t.PurchasedAt)
            .ToListAsync();

        return tickets.Select(t => new EventTicketDto
        {
            Id = t.Id,
            EventId = t.EventId,
            EventTitle = t.Event.Title,
            EventDate = t.Event.EventDate,
            Quantity = t.Quantity,
            TotalPrice = t.TotalPrice,
            Status = t.Status.ToString(),
            PurchasedAt = t.PurchasedAt
        });

    }

    public async Task<EventDto> UpdateAsync(int id, CreateEventDto dto)
    {
        var ev = await _context.Events.FindAsync(id)
         ?? throw new InvalidOperationException("Event not found");

        ev.Title = dto.Title;
        ev.Description = dto.Description;
        ev.ImageUrl = dto.ImageUrl;
        ev.EventDate = dto.EventDate;
        ev.StartTime = dto.StartTime;
        ev.EndTime = dto.EndTime;
        ev.Location = dto.Location;
        ev.TicketPrice = dto.TicketPrice;
        ev.TotalSlots = dto.TotalSlots;

        await _context.SaveChangesAsync();
        return ToDto(ev);
    }

    private static EventDto ToDto(Event ev)
    {
        var now = DateTime.UtcNow.Date;
        var eventDate = ev.EventDate.Date;
        var status = eventDate > now ? "Upcoming"
            : eventDate == now ? "Happening"
            : "Expired";

        return new EventDto
        {
          Id = ev.Id,
          Title = ev.Title,
          Description = ev.Description,
          ImageUrl = ev.ImageUrl,
          EventDate = ev.EventDate,
          StartTime = ev.StartTime,
          EndTime = ev.EndTime,
          Location = ev.Location,
          TicketPrice = ev.TicketPrice,
          TotalSlots = ev.TotalSlots,
          BookedSlots = ev.BookedSlots,
          IsActive = ev.IsActive,
          Status = status  
        };
    }
}