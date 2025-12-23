using EHR_Reports.Configuration;
using EHR_Reports.Data;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace EHR_Reports.Services
{
    public class JWTService : IJWTService
    {
        private readonly JWTSettings _settings;
        private readonly ApplicationDbContext _context;

        public JWTService(IOptions<JWTSettings> settings, ApplicationDbContext context)
        {
            _settings = settings.Value;
            _context = context;
        }

        /// <summary>
        /// Generates a JWT access token.
        /// </summary>
        public async Task<string> GenerateAccessToken(string userId)
        {
            try
            {
                var role = await (from ur in _context.UserRoles
                                 join r in _context.Roles on ur.RoleId equals r.Id
                                 where ur.UserId == userId
                                 select r.Name).FirstOrDefaultAsync();
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
                var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, userId),
                    new Claim(ClaimTypes.Role, role)
                };

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddMinutes(_settings.ExpiresInMinutes),
                    Issuer = _settings.Issuer,
                    Audience = _settings.Audience,
                    SigningCredentials = credentials
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var token = tokenHandler.CreateToken(tokenDescriptor);
                return tokenHandler.WriteToken(token);
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        /// <summary>
        /// Generates or updates a refresh token in the database.
        /// One active token per user.
        /// </summary>
        public async Task<RefreshToken> GenerateRefreshToken(string userId)
        {
            try
            {
                var existingToken = await _context.RefreshTokens.FirstOrDefaultAsync(t => t.UserId == userId);
                var newToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
                System.DateTime expiresAt = DateTime.UtcNow.AddDays(_settings.RefreshTokenExpiresInDays);

                if (existingToken != null)
                {
                    existingToken.Token = newToken;
                    existingToken.ExpiresAt = expiresAt;
                    existingToken.CreatedAt = DateTime.UtcNow;
                    existingToken.RevokedAt = null;

                    _context.RefreshTokens.Update(existingToken);
                }
                else
                {
                    var refreshToken = new RefreshToken
                    {
                        UserId = userId,
                        Token = newToken,
                        ExpiresAt = expiresAt
                    };

                    _context.RefreshTokens.Add(refreshToken);
                }
                await _context.SaveChangesAsync();
                return existingToken ?? new RefreshToken
                {
                    UserId = userId,
                    Token = newToken,
                    ExpiresAt = expiresAt
                };
            }
            catch (Exception)
            {
                return null;
            }
        }

        /// <summary>
        /// Validates a refresh token: checks existence, expiry, revocation.
        /// Returns UserId and current Role from DB to prevent stale permissions.
        /// </summary
        public async Task<string> ValidateRefreshToken(string token)
        {
            try
            {
                var storedToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(t => t.Token == token);

                if (storedToken == null || storedToken.IsRevoked || storedToken.ExpiresAt < DateTime.UtcNow)
                    return null;

                return storedToken.UserId;
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> RevokeRefreshToken(string token)
        {
            try
            {
                var storedToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(t => t.Token == token);
                if (storedToken == null || storedToken.IsRevoked) return false;

                storedToken.RevokedAt = DateTime.UtcNow;
                _context.RefreshTokens.Update(storedToken);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }
    }

}
