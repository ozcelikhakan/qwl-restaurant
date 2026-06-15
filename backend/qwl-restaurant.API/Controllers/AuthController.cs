using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using QwlRestaurant.Business.Services.Abstract;
using QwlRestaurant.Entities.Concrete;
using QwlRestaurant.Entities.DTOs.Auth;

namespace QwlRestaurant.API.Controllers;

[ApiController]
[Route("api/[controller]")]

public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    private readonly UserManager<AppUser> _userManager;

    public AuthController(IAuthService authService, UserManager<AppUser> userManager)
    {
        _authService = authService;
        _userManager = userManager;
    }

    // POST: api/auth/register
    // Creates a new user account.
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
           var result = await _authService.RegisterAsync(dto);
           return Ok(result); 
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message});
        }
    }

    // POST: api/auth/login
    // Authenticates the user and returns token information.
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var result = await _authService.LoginAsync(dto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message});
        }
    }

    // POST: api/auth/refresh
    // Generates a new access token using a valid refresh token.
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto)
    {
        try
        {
            var result = await _authService.RefreshTokenAsync(dto.RefreshToken);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    // POST: api/auth/revoke
    // Revokes the current user's refresh token.
    // This endpoint requires authentication.
    [Authorize]
    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _authService.RevokeTokenAsync(userId);
        return NoContent();
    }

    // GET: api/auth/me
    // Returns information about the currently authenticated user.
    // This endpoint requires authentication.
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            userId = User.FindFirstValue(ClaimTypes.NameIdentifier),
            email = User.FindFirstValue(ClaimTypes.Email),
            firstName = User.FindFirstValue(ClaimTypes.GivenName),
            lastName = User.FindFirstValue(ClaimTypes.Surname),
            roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value)
        });       
    }

    // PUT: api/auth/change-password
    // Changes the password of the currently authenticated user.
    // This endpoint requires authentication.
    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _authService.ChangePasswordAsync(userId, dto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message});

        }
    }

    // PUT: api/auth/profile
    // Updates the profile information of the currently authenticated user.
    // This endpoint requires authentication.
    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _authService.UpdateProfileAsync(userId, dto);

            var user = await _userManager.FindByIdAsync(userId);
            return Ok(new
            {
                firstName = user!.FirstName,
                lastName  = user.LastName,
                phone     = user.PhoneNumber,
                avatarUrl = user.AvatarUrl
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message});
            
        }
    }

}

