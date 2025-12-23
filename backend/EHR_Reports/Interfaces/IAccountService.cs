using EHR_Reports.DTOs.Account;
using EHR_Reports.Models;

namespace EHR_Reports.Interfaces
{
    public interface IAccountService
    {
        Task<ResponseModel<bool>> ForgotPassword(ForgotPasswordDto model);
        Task<ResponseModel<bool>> ResetPassword(ResetPasswordDto model);
        Task<ResponseModel<UserDto>> Login(LoginDto loginDto);
        Task<ResponseModel<bool>> Logout();
    }
}
