using QwlRestaurant.Entities.DTOs.Auth;

namespace QwlRestaurant.Business.Services.Abstract;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task RevokeTokenAsync(string userID);
    Task UpdateProfileAsync(string userID, UpdateProfileDto dto);
    Task ChangePasswordAsync(string userID, ChangePasswordDto dto);
    
}
