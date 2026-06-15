using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using QwlRestaurant.DataAccess.Context;
using QwlRestaurant.Entities.Concrete;

namespace QwlRestaurant.API.Extensions;

public static class SeedExtensions
{
    public static async Task SeedRolesAndAdminAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var config      = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var db          = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        //Roles
        string[] roles = ["Admin", "Customer"];
        foreach (var role in roles)
        {
            if(!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        //Admin user
        var adminEmail = config["AdminSeed:Email"] ?? "admin@qwlrestaurant.com";
        var adminPassword = config["AdminSeed:Password"] ?? "Admin123!";

        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var admin = new AppUser
            {
                UserName    = adminEmail,
                Email       = adminEmail,
                FirstName   = "Admin",
                LastName    = "User",
                EmailConfirmed = true
            
            };
            var result = await userManager.CreateAsync(admin, adminPassword);
            if (result.Succeeded)
                await userManager.AddToRoleAsync(admin, "Admin");
        }

        //Test customer user
        var testEmail   = config["TestCustonerSeed: Email"] ?? "test@qwlrestaurant.com";
        var testPassword = config["TestCustomerSeed: Password"] ?? "Test123!";

        if (await userManager.FindByEmailAsync(testEmail) == null)
        {
            var customer = new AppUser
            {
                UserName  = testEmail,
                Email     = testEmail,
                FirstName = "test",
                LastName  = "user",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(customer, testPassword);
            if (result.Succeeded)
                await userManager.AddToRoleAsync(customer, "Customer");
        }

        //Menu categories
        if (!await db.MenuCategories.AnyAsync())
        {
            db.MenuCategories.AddRange(
                new MenuCategory  { Name = "Breakfast", Slug="breakfast", DisplayOrder = 1, IsActive = true},
                new MenuCategory  { Name = "Lunch", Slug = "lunch", DisplayOrder = 2, IsActive = true},
                new MenuCategory  { Name = "Dinner", Slug = "dinner", DisplayOrder = 3, IsActive = true}
            );
            await db.SaveChangesAsync();

        }
    }
}