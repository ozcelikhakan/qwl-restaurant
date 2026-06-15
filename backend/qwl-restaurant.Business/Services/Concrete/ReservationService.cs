using System.Xml;
using Microsoft.EntityFrameworkCore;
using QwlRestaurant.DataAccess.Context;
using QwlRestaurant.Entities.Concrete;
using QwlRestaurant.Entities.DTOs.Reservation;

namespace QwlRestaurant.Business.Services.Concrete;

public class ReservationService : IReservationService
{
    private readonly AppDbContext _context;

    public ReservationService(AppDbContext context)
    {
        _context = context;
    }

    // Creates a new reservation
    public async Task<ReservationDto> CreateAsync(CreateReservationDto dto, string? userId)
    {
        var reservation = new Reservation
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            ReservationDate = dto.ReservationDate,
            ReservationTime = dto.ReservationTime,
            PersonCount = dto.PersonCount,
            Message = dto.Message,
            TableNumber = dto.TableNumber,
            AppUserId = userId
        };

        await _context.Reservations.AddAsync(reservation);
        await _context.SaveChangesAsync();
        return ToDto(reservation);
    }
    // Deletes a reservation by its ID
    public async Task DeleteAsync(int id)
    {
        var r = await _context.Reservations.FindAsync(id)
            ?? throw new InvalidOperationException("Reservation not found");

        _context.Reservations.Remove(r);
        await _context.SaveChangesAsync();
    }
    // Returns all reservations ordered by creation date
    public async Task<IEnumerable<ReservationDto>> GetAllAsync()
    {
        var list = await _context.Reservations
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();
        return list.Select(ToDto);
    }
    // Returns a single reservation by its ID
    public async Task<ReservationDto> GetByIdAsync(int id)
    {
        var r = await _context.Reservations.FindAsync(id);
        if (r == null)
            throw new KeyNotFoundException($"Reservation {id} not found.");
        return ToDto(r);
    }
    // Returns occupied table numbers for a specific date and time
    public async Task<IEnumerable<string>> GetOccupiedTablesAsync(DateTime date, TimeSpan time)
    {
        return await _context.Reservations
            .Where(r => r.ReservationDate == date.Date
            && r.ReservationTime == time
            && r.Status != ReservationStatus.Cancelled
            && r.TableNumber != null)
        .Select(r => r.TableNumber!)
        .ToListAsync();
    }

    // Updates the status of an existing reservation 
    public async Task UpdatesStatusAsync(int id, int status)
    {
        var r = await _context.Reservations.FindAsync(id)
            ?? throw new InvalidOperationException("Reservation not found");
        r.Status = (ReservationStatus)status;
        await _context.SaveChangesAsync();
    }
    // Converts a Reservation entity to a ReservationDto
    private static ReservationDto ToDto(Reservation r) => new()
    {
        Id = r.Id,
        FullName = r.FullName,
        Email = r.Email,
        Phone = r.Phone,
        ReservationDate = r.ReservationDate,
        ReservationTime = r.ReservationTime,
        PersonCount = r.PersonCount,
        Message = r.Message,
        TableNumber = r.TableNumber,
        Status = r.Status,
        CreatedAt = r.CreatedAt
    };
}