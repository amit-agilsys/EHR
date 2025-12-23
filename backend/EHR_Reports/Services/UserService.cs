using EHR_Reports.Configuration;
using EHR_Reports.DTOs;
using EHR_Reports.DTOs.Account;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using EHR_Reports.Models.Role;
using EHR_Reports.Utilities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Text;

namespace EHR_Reports.Services
{
    public class UserService : IUserService
    {
        private readonly Data.ApplicationDbContext _context;
        private readonly IEmailService _emailSender;
        private readonly IViewRenderService _viewRenderService;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly UserManager<User> _userManager;
        private string clientUrl = "";
        public UserService(
            Data.ApplicationDbContext context,
            UserManager<User> userManager,
            RoleManager<ApplicationRole> roleManager,
            IEmailService emailSender,
            IViewRenderService viewRenderService,
            IOptions<SmtpSettings> smtpSettings
            )
        {
            _userManager = userManager;
            _roleManager = roleManager;
            clientUrl = smtpSettings.Value.ClientUrl;
            _emailSender = emailSender;
            _viewRenderService = viewRenderService;
            _context = context;
        }

        public async Task<DataTableResponse<UserDto>> GetAllUsers(UserDataTableRequest request)
        {
            try
            {
                var query = from u in _context.Users.AsNoTracking()
                            where !u.IsDeleted
                            join ur in _context.UserRoles on u.Id equals ur.UserId into userRoles
                            from ur in userRoles.DefaultIfEmpty()
                            join r in _context.Roles on ur.RoleId equals r.Id into roles
                            from r in roles.DefaultIfEmpty()
                            select new { User = u, RoleId = ur != null ? ur.RoleId : null, RoleName = r != null ? r.Name : null };

                if (!string.IsNullOrEmpty(request.Search))
                {
                    var searchText = request.Search.Trim().ToLower();
                    query = query.Where(x =>
                        x.User.Name.ToLower().Contains(searchText) ||
                        x.User.Email.ToLower().Contains(searchText) ||
                        x.User.PhoneNumber.ToLower().Contains(searchText)
                    );
                }

                if (request.EmailConfirmed.HasValue)
                {
                    query = query.Where(x => x.User.EmailConfirmed == request.EmailConfirmed.Value);
                }

                if (!string.IsNullOrEmpty(request.Role))
                {
                    query = query.Where(x => x.RoleId == request.Role);
                }

                var totalRecords = await _context.Users.CountAsync();
                var filteredRecords = await query.CountAsync();

                if (!string.IsNullOrEmpty(request.SortColumn))
                {
                    var orderColumn = request.SortColumn;
                    var orderDirection = request.SortDirection;

                    if (orderColumn == "role")
                    {
                        query = orderDirection == "desc"
                            ? query.OrderByDescending(x => x.RoleName)
                            : query.OrderBy(x => x.RoleName);
                    }
                    else if (orderColumn == "name")
                    {
                        query = orderDirection == "desc"
                            ? query.OrderByDescending(x => x.User.Name)
                            : query.OrderBy(x => x.User.Name);
                    }
                    else if (orderColumn == "email")
                    {
                        query = orderDirection == "desc"
                            ? query.OrderByDescending(x => x.User.Email)
                            : query.OrderBy(x => x.User.Email);
                    } else if(orderColumn == "emailConfirmed")
                    {
                        query = orderDirection == "desc"
                            ? query.OrderByDescending(x => x.User.EmailConfirmed)
                            : query.OrderBy(x => x.User.EmailConfirmed);
                    }
                }
                else
                {
                    query = query.OrderBy(x => x.User.Name);
                }

                var page = request.Page > 0 ? request.Page : 1;
                var limit = request.Limit > 0 ? request.Limit : totalRecords;

                var users = await query
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .Select(x => new UserDto
                    {
                        Id = x.User.Id,
                        Name = x.User.Name,
                        Email = x.User.Email,
                        PhoneNumber = x.User.PhoneNumber,
                        EmailConfirmed = x.User.EmailConfirmed,
                        RoleId = x.RoleId,
                        Role = x.RoleName
                    })
                    .ToListAsync();

                return new DataTableResponse<UserDto>
                {
                    Success = true,
                    Data = users,
                    TotalRecords = totalRecords,
                    FilteredRecords = filteredRecords
                };
            }
            catch (Exception ex)
            {
                return new DataTableResponse<UserDto>
                {
                    Success = false,
                    Message = $"Error retrieving users: {ex.Message}",
                    Data = new List<UserDto>(),
                    TotalRecords = 0,
                    FilteredRecords = 0
                };
            }
        }

        public async Task<ResponseModel<UserDto>> GetUserById(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                {
                    return ResponseModel<UserDto>.Failure($"User with ID '{id}' not found.");
                }
                var roles = await _userManager.GetRolesAsync(user);

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    EmailConfirmed = user.EmailConfirmed,
                    PhoneNumber = user.PhoneNumber,
                    Role = string.Join(",", roles)
                };

                return ResponseModel<UserDto>.SuccessResult(userDto, "User retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<UserDto>.Failure($"Error retrieving user: {ex.Message}");
            }
        }

        public async Task<ResponseModel<bool>> CreateUser(UserDto userDto)
        {
            try
            {
                var existingUser = await _userManager.FindByEmailAsync(userDto.Email);
                if (existingUser != null)
                {
                    return ResponseModel<bool>.Failure($"User with email '{userDto.Email}' already exists.");
                }

                var existingRole = await _roleManager.FindByIdAsync(userDto.Role);
                if (existingRole == null)
                {
                    return ResponseModel<bool>.Failure("invalid role. Please try again later or contact the system administrator if the issue persists.");
                }


                var existingPhoneNumber = await _userManager.Users.FirstOrDefaultAsync(u => u.PhoneNumber == userDto.PhoneNumber);
                if (existingPhoneNumber != null)
                {
                    return ResponseModel<bool>.Failure($"User with phone number '{userDto.PhoneNumber}' already exists.");
                }


                var user = new User
                {
                    Name = userDto.Name,
                    UserName = userDto.Email,
                    Email = userDto.Email,
                    PhoneNumber = userDto.PhoneNumber
                };

                var result = await _userManager.CreateAsync(user, "12345678");
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description).ToList();
                    return ResponseModel<bool>.Failure(errors);
                }

                var roleResult = await _userManager.AddToRoleAsync(user, existingRole.Name);
                if (!roleResult.Succeeded)
                {
                    var errors = roleResult.Errors.Select(e => e.Description).ToList();
                    return ResponseModel<bool>.Failure(errors);
                }

                if (!await SendResetPasswordEmailAsync(user))
                {
                    return ResponseModel<bool>.Failure("Failed to send reset password email.");
                }

                return ResponseModel<bool>.SuccessResult(true, "User created successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<bool>.Failure($"Error creating user: {ex.Message}");
            }

        }

        public async Task<ResponseModel<bool>> UpdateUser(UserDto userDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userDto.Id);
                if (user == null)
                {
                    return ResponseModel<bool>.Failure($"This user doesn’t exist in our system.");
                }

                var existingRole = await _roleManager.FindByIdAsync(userDto.Role);
                if (existingRole == null)
                {
                    return ResponseModel<bool>.Failure($"Role '{userDto.Role}' does not exist.");
                }

                var existingUser = await _userManager.FindByEmailAsync(userDto.Email);
                if (existingUser != null && existingUser.Id != user.Id)
                {
                    return ResponseModel<bool>.Failure($"User with email '{userDto.Email}' already exists.");
                }

                var existingPhoneNumber = await _userManager.Users.FirstOrDefaultAsync(u => u.PhoneNumber == userDto.PhoneNumber && u.Id != user.Id);
                if (existingPhoneNumber != null)
                {
                    return ResponseModel<bool>.Failure($"User with phone number '{userDto.PhoneNumber}' already exists.");
                }

                user.Name = userDto.Name;
                user.Email = userDto.Email;
                user.PhoneNumber = userDto.PhoneNumber;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description).ToList();
                    return ResponseModel<bool>.Failure(errors);
                }

                var newRoleName = existingRole.Name;
                var currentRoles = await _userManager.GetRolesAsync(user);
                if (!currentRoles.Contains(newRoleName))
                {
                    if (currentRoles.Any())
                    {
                        await _userManager.RemoveFromRolesAsync(user, currentRoles);
                    }

                    await _userManager.AddToRoleAsync(user, newRoleName);
                }

                return ResponseModel<bool>.SuccessResult(true, "User updated successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<bool>.Failure($"Error updating user: {ex.Message}");
            }
        }

        public async Task<ResponseModel<bool>> DeleteUser(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                    return ResponseModel<bool>.Failure("This user doesn’t exist in our system.");

                var roles = await _userManager.GetRolesAsync(user);
                if (roles.Contains("Doctor"))
                    return ResponseModel<bool>.Failure("Doctor user cannot be deleted.");

                user.IsDeleted = true;
                var result = await _userManager.UpdateAsync(user);
                if (result.Succeeded)
                    return ResponseModel<bool>.SuccessResult(true, "User deleted successfully.");
                var errors = new List<string>();

                return ResponseModel<bool>.Failure("Unable to delete the user. Please try again later or contact the system administrator if the issue persists.");
            }
            catch (Exception ex)
            {
                return ResponseModel<bool>.Failure($"Error deleting user: {ex.Message}");
            }
        }

        public async Task<ResponseModel<bool>> SuspendUser(string id)

        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);

                if (user == null)

                    return ResponseModel<bool>.Failure("This user doesn’t exist in our system.");

                var result = await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);

                if (result.Succeeded)

                    return ResponseModel<bool>.SuccessResult(true, "User suspended successfully.");

                var errors = new List<string>();

                return ResponseModel<bool>.Failure("Unable to suspend the user. Please try again later or contact the system administrator if the issue persists.");

            }

            catch (Exception ex)
            {
                return ResponseModel<bool>.Failure($"Error suspending user: {ex.Message}");
            }

        }

        public async Task<ResponseModel<bool>> ActivateUser(string id)

        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);

                if (user == null)

                    return ResponseModel<bool>.Failure("This user doesn’t exist in our system.");

                var result = await _userManager.SetLockoutEndDateAsync(user, null);

                if (result.Succeeded)

                {
                    await _userManager.ResetAccessFailedCountAsync(user);

                    return ResponseModel<bool>.SuccessResult(true, "User activated successfully.");

                }

                var errors = new List<string>();

                return ResponseModel<bool>.Failure("Unable to activate the user. Please try again later or contact the system administrator if the issue persists.");
            }
            catch (Exception ex)
            {
                return ResponseModel<bool>.Failure($"Error activate user: {ex.Message}");
            }
        }

        public async Task<bool> SendResetPasswordEmailAsync(User user)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var callbackUrl = $"{clientUrl}/reset-password?token={Uri.EscapeDataString(token)}&email={user.Email}";

            var emailDto = new ResetPasswordEmailDto
            {
                Logo = "http://localhost:4200/assets/images/login-logo.png",
                Name = user.Name,
                CallbackUrl = callbackUrl
            };
            var emailBody = await _viewRenderService.RenderToStringAsync("Template/ResetPassword/NewUserSetPasswordEmail", emailDto);
            var emailSubject = "Set Your Password";
            return await _emailSender.SendEmailAsync(user.Email, emailSubject, emailBody);
        }

        public async Task<IdentityResult> AssignRoleAsync(User user, string roleName)
        {
            var currentRoles = await _userManager.GetRolesAsync(user);

            if (currentRoles.Any())
            {
                var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
                if (!removeResult.Succeeded)
                {
                    return removeResult;
                }
            }
            return await _userManager.AddToRoleAsync(user, roleName);
        }

        public async Task<string?> GetUserRoleAsync(User user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            return roles.FirstOrDefault();
        }

        public async Task<List<PermissionNameDto>> GetUserPermissionsAsync(string userId)
        {
            var userRole = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Select(ur => ur.RoleId)
                .FirstOrDefaultAsync();

            if (userRole == null)
                return new List<PermissionNameDto>();

            var permissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == userRole)
                .Include(rp => rp.Screen)
                .Include(rp => rp.ScreenAction)
                .Select(rp => new PermissionNameDto
                {
                    ScreenName = rp.Screen.ScreenName,
                    ActionName = rp.ScreenAction.ActionName
                })
                .ToListAsync();

            return permissions;
        }
    }
}
