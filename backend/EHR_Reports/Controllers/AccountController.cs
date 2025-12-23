using EHR_Reports.DTOs.Account;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly IJWTService _jwtService;

        public AccountController(IAccountService accountService, IJWTService jwtService)
        {
            _accountService = accountService;
            _jwtService = jwtService;
        }


        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ResponseModel<string>.Failure("Invalid request payload."));

            var response = await _accountService.Login(loginDto);

            if (response == null || !response.Success || response.Data == null)
                return BadRequest(ResponseModel<string>.Failure("Invalid username or password."));

            var user = response.Data;
            await SetAuthCookiesAsync(user.Id);

            // Construct response
            var loginResponse = new LoginResponse
            {
                User = user,
                AccessToken = await _jwtService.GenerateAccessToken(user.Id)
            };

            return Ok(ResponseModel<LoginResponse>.SuccessResult(loginResponse, "Login successful."));
        }

        [HttpPost]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(ResponseModel<string>.Failure("No refresh token found."));

            var result = await _jwtService.ValidateRefreshToken(refreshToken);
            if (result == null)
                return Unauthorized(ResponseModel<string>.Failure("Invalid or expired refresh token."));

            // Generate new tokens
            await SetAuthCookiesAsync(result);
            var newAccessToken = await _jwtService.GenerateAccessToken(result);
            return Ok(ResponseModel<string>.SuccessResult(newAccessToken, "Token refreshed."));
        }


        [HttpGet]
        public async Task<ActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (!string.IsNullOrEmpty(refreshToken))
            {
                await _jwtService.RevokeRefreshToken(refreshToken);
            }
            // Clear the cookie
            Response.Cookies.Delete("refreshToken");

            var response = await _accountService.Logout();
            return Ok(response);
        }


        [HttpPost]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto resetPasswordDto)
        {
            var response = await _accountService.ResetPassword(resetPasswordDto);
            if (response == null || !response.Success)
                return BadRequest(ResponseModel<string>.Failure(response.Message));
            return Ok(response);

        }

        [HttpPost]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPassword)
        {

            if (!ModelState.IsValid)
                return BadRequest(ResponseModel<string>.Failure("Invalid request payload."));

            var response = await _accountService.ForgotPassword(forgotPassword);
            if (response == null || !response.Success)
                return BadRequest(ResponseModel<string>.Failure(response.Message));
            return Ok(response);
        }

        /// <summary>
        /// Sets HTTP-only, secure refresh token cookie
        /// </summary>
        private async Task SetAuthCookiesAsync(string userId)
        {
            var refreshToken = await _jwtService.GenerateRefreshToken(userId);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, 
                SameSite = SameSiteMode.Lax, 
                Expires = refreshToken.ExpiresAt.ToLocalTime() 
            };

            Response.Cookies.Append("refreshToken", refreshToken.Token, cookieOptions);
        }
    }
}
