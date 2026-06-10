using Microsoft.EntityFrameworkCore;
using QwlRestaurant.Business.Services.Abstract;
using QwlRestaurant.DataAccess.Context;
using QwlRestaurant.Entities.Concrete;
using QwlRestaurant.Entities.DTOs.Contact;

namespace QwlRestaurant.Business.Services.Concrete;

public class ContactService : IContactService
{

    private readonly AppDbContext _context;

     //Dependency Injection
    public ContactService(AppDbContext context)
    {
        _context = context;
    }

    // Deletes the selected contact message.
    public async Task DeleteAsync(int id)
    {
        var message = await _context.ContactMessages.FindAsync(id)
         ?? throw new InvalidOperationException("Message not found");
         _context.ContactMessages.Remove(message);
         await _context.SaveChangesAsync();
    }

    // Retrieves all contact messages ordered from newest to oldest.
    // This method uses expression-bodied syntax (=>), which is a shorter form of writing a method that directly returns a single expression.
    public async Task<IEnumerable<ContactMessage>> GetAllAsync()
        => await _context.ContactMessages
        .OrderByDescending(m => m.CreatedAt)
        .ToListAsync();
    
    // Marks the selected contact message as read.
    public async Task MarkAsReadAsync(int id)
    {
        var message = await _context.ContactMessages.FindAsync(id)
         ?? throw new InvalidOperationException("Message not found");
         message.IsRead = true;
         await _context.SaveChangesAsync();
    }
    // Creates and saves a new contact message.
    public async Task SendMessageAsync(CreateContactMessageDto dto)
    {
        var message = new ContactMessage
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            Subject = dto.Subject,
            Message = dto.Message
        };

        await _context.ContactMessages.AddAsync(message);
        await _context.SaveChangesAsync();
    }


}