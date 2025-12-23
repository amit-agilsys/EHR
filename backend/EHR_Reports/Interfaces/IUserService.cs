using EHR_Reports.DTOs.Account;
using EHR_Reports.Models;

namespace EHR_Reports.Interfaces
{
    public interface IUserService
    {
        Task<DataTableResponse<UserDto>> GetAllUsers(UserDataTableRequest request);
        Task<ResponseModel<UserDto>> GetUserById(string id);
        Task<ResponseModel<bool>> CreateUser(UserDto userDto);
        Task<ResponseModel<bool>> UpdateUser(UserDto userDto);
        Task<ResponseModel<bool>> DeleteUser(string id);
        Task<ResponseModel<bool>> SuspendUser(string id);
        Task<ResponseModel<bool>> ActivateUser(string id);
        Task<bool> SendResetPasswordEmailAsync(User user);
    }
}
