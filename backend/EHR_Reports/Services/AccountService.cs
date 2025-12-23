using EHR_Reports.DTOs.Account;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;

namespace EHR_Reports.Services
{
    public class AccountService : IAccountService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IUserService _userService;
        private readonly IRoleService _role;

        public AccountService(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IUserService userService,
            IRoleService role
            )
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _userService = userService;
            _role = role;
        }


        public async Task<ResponseModel<bool>> ForgotPassword(ForgotPasswordDto model)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    return ResponseModel<bool>.SuccessResult(true, "If the submitted email exists, you will receive an email shortly");
                }


                if (user.IsDeleted)
                {
                    return ResponseModel<bool>.Failure("Your account has been deleted. Please contact support.");
                }

                if (await _userManager.IsLockedOutAsync(user))
                {
                    return ResponseModel<bool>.Failure("Your account has been permanently locked. Please contact support.");
                }

                //Send Reset password email
                var result = await _userService.SendResetPasswordEmailAsync(user);
                if (!result)
                {
                    return ResponseModel<bool>.Failure("Failed to send reset password email.");
                }
                return ResponseModel<bool>.SuccessResult(true, "If the submitted email exists, you will receive an email shortly");
            }
            catch (Exception ex)
            {
                return ResponseModel<bool>.Failure($"Error forgot password: {ex.Message}");
            }

        }

        public async Task<ResponseModel<bool>> ResetPassword(ResetPasswordDto model)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    return ResponseModel<bool>.Failure($"This user doesn’t exist in our system. Please verify your information or create a new account.");
                }

                if (user.IsDeleted)
                {
                    return ResponseModel<bool>.Failure("Your account has been deleted. Please contact support.");
                }

                if (await _userManager.IsLockedOutAsync(user))
                {
                    return ResponseModel<bool>.Failure("Your account has been permanently locked. Please contact support.");
                }

                if (!await _userManager.IsEmailConfirmedAsync(user))
                {
                    var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    await _userManager.ConfirmEmailAsync(user, token);
                }

                var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

                var result = await _userManager.ResetPasswordAsync(user, decodedToken, model.Password);

                if (!result.Succeeded)
                {
                    var errors = new List<string>();
                    foreach (var error in result.Errors)
                    {
                        errors.Add(error.Description);
                    }
                    return ResponseModel<bool>.Failure(errors);
                }
                return ResponseModel<bool>.SuccessResult(true, "Password reset successful.");
            }
            catch (Exception ex)
            {
                return ResponseModel<bool>.Failure($"Error resetting password: {ex.Message}");
            }

        }
        public async Task<ResponseModel<UserDto>> Login(LoginDto loginDto)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    return ResponseModel<UserDto>.Failure($"Email or password is incorrect.");
                }

                var checkUser = await CheckUser(user);
                if (!checkUser.Success)
                {
                    return ResponseModel<UserDto>.Failure(checkUser.Message);
                }

                var result = await _signInManager.PasswordSignInAsync(loginDto.Email, loginDto.Password, false, false);
                if (result.Succeeded)
                {
                    var permissions = await _role.GetUserPermissionsAsync(user.Id);
                    UserDto userDto = new UserDto()
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email,
                        PhoneNumber = user.PhoneNumber,
                        Role = (await _userManager.GetRolesAsync(user)).FirstOrDefault() ?? "No Role",
                        Permissions = permissions
                    };

                    return ResponseModel<UserDto>.SuccessResult(userDto, "Login successful.");
                }
                else
                {
                    return ResponseModel<UserDto>.Failure("Email or password is incorrect.");
                }
            }
            catch (Exception ex)

            {
                return ResponseModel<UserDto>.Failure($"Error logging in: {ex.Message}");
            }
        }

        private async Task<ResponseModel<bool>> CheckUser(User user)
        {
            try
            {
                if (!user.EmailConfirmed)
                {
                    return ResponseModel<bool>.Failure("Your account has not been confirmed. Please check your email for a confirmation link.");
                }

                if (user.IsDeleted)
                {
                    return ResponseModel<bool>.Failure("Your account has been deleted. Please contact support.");
                }

                if (await _userManager.IsLockedOutAsync(user))
                {
                    return ResponseModel<bool>.Failure("Your account has been permanently locked. Please contact support.");
                }

                return ResponseModel<bool>.SuccessResult(true, "User found.");

            }
            catch (Exception)
            {
                return ResponseModel<bool>.Failure("Error checking user.");
            }
        }
        public async Task<ResponseModel<bool>> Logout()
        {
            try
            {
                await _signInManager.SignOutAsync();
                return ResponseModel<bool>.SuccessResult(true, "Logout successful.");
            }
            catch (Exception ex)
            {
                return ResponseModel<bool>.Failure($"Error logging out: {ex.Message}");
            }
        }


    }

}
