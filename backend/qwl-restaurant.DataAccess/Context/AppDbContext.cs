using System.Text.Json;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using QwlRestaurant.Entities.Concrete;


namespace QwlRestaurant.DataAccess.Context;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<EventTicket> EventTickets => Set<EventTicket>();
    public DbSet<MenuCategory> MenuCategories => Set<MenuCategory>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<DailySpecial> DailySpecials => Set<DailySpecial>();
    public DbSet<Blog> Blogs => Set<Blog>();
    public DbSet<BlogComment> BlogComments => Set<BlogComment>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<AppUser>(e =>
        {
           e.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
           e.Property(u => u.LastName).HasMaxLength(100).IsRequired();

        });
        
        builder.Entity<Reservation>(e =>
        {
           e.Property(r => r.FullName).HasMaxLength(200).IsRequired();
           e.Property(r => r.Email).HasMaxLength(256).IsRequired();
           e.Property(r => r.Phone).HasMaxLength(20).IsRequired();
           e.HasOne(r => r.AppUser).WithMany(u => u.Reservations)
               .HasForeignKey(r => r.AppUserId).OnDelete(DeleteBehavior.SetNull); 
        });

        builder.Entity<Event>(e =>
        {
            e.Property(ev => ev.Title).HasMaxLength(300).IsRequired();
            e.Property(ev => ev.TicketPrice).HasColumnType("decimal(10,2)");
        });

        builder.Entity<EventTicket>(e =>
        {
            e.Property(t =>t.TotalPrice).HasColumnType("decimal(10,2)");
            e.HasOne(t => t.AppUser).WithMany(u => u.EventTickets)
                .HasForeignKey(t => t.AppUserId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<MenuItem>(e =>
        {
           e.Property(m => m.Price).HasColumnType("decimal(10,2)");
           e.Property(m => m.Name).HasMaxLength(200).IsRequired(); 
        });

        builder.Entity<DailySpecial>(e =>
        {
            e.Property(d => d.Price).HasColumnType("decimal(10,2)");
            e.Property(d => d.Title).HasMaxLength(200).IsRequired();
        });

        builder.Entity<Blog>(e =>
        {
            e.Property(b => b.Slug).HasMaxLength(300).IsRequired();
            e.HasIndex(b => b.Slug).IsUnique();
            e.Property(b => b.Tags).HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<string[]>(v, (JsonSerializerOptions?)null) ?? Array.Empty<string>(),
                new ValueComparer<string[]>(
                    (a,b) => a != null && b != null && a.SequenceEqual(b),
                    v => v.Aggregate(0, (acc, s) => HashCode.Combine(acc, s.GetHashCode())),
                    v => v.ToArray()
                )
            );
            e.HasOne(b => b.Author).WithMany(u => u.Blogs)
                .HasForeignKey(b => b.AuthorId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<BlogComment>(e =>
        {
            e.Property(c => c.AuthorEmail).HasMaxLength(256).IsRequired();
        });

        builder.Entity<MenuCategory>(e =>
        {
            e.Property(c => c.Slug).HasMaxLength(100).IsRequired();
            e.HasIndex(c => c.Slug).IsUnique();
        });

        
    }

    
}