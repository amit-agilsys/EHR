using EHR_Reports.DTOs;
using EHR_Reports.Models;

namespace EHR_Reports.Interfaces
{
    public interface IJWTService
    {
        Task<string> GenerateAccessToken(string userId);
        Task<RefreshToken> GenerateRefreshToken(string userId);
        Task<string> ValidateRefreshToken(string token);
        Task<bool> RevokeRefreshToken(string token);
    }
}
