using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class JwtValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;
    private readonly ILogger<JwtValidationMiddleware> _logger;

    private static readonly string[] ExcludedPaths = new[]
    {
        "/api/Account/Login",
        "/api/Account/Refresh",
        "/api/Account/Logout",
        "/api/Account/ForgotPassword",
        "/api/Account/ResetPassword",
        "/swagger",
        "/openapi",
        "/api/auth/"  
    };

    public JwtValidationMiddleware(RequestDelegate next, IConfiguration configuration, ILogger<JwtValidationMiddleware> logger)
    {
        _next = next;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLower() ?? string.Empty;

        // Skip validation for excluded paths
        if (ShouldBypassValidation(path))
        {
            _logger.LogInformation($"Bypassing JWT validation for: {path}");
            await _next(context);
            return;
        }

        var token = context.Request.Headers["authorization"].FirstOrDefault()?.Split(" ").Last();

        if (string.IsNullOrEmpty(token))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { message = "Token missing" });
            return;
        }

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["JWTSettings:Key"] ?? string.Empty);

            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _configuration["JWTSettings:Issuer"],
                ValidateAudience = true,
                ValidAudience = _configuration["JWTSettings:ClientUrl"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            context.User = new ClaimsPrincipal(new ClaimsIdentity(jwtToken.Claims, "jwt"));

            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "JWT validation failed");
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { message = "Invalid token" });
        }
    }

    private static bool ShouldBypassValidation(string path)
    {
        return ExcludedPaths.Any(excluded => path.StartsWith(excluded.ToLower()));
    }
}
