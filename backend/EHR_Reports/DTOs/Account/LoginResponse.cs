using EHR_Reports.Models;

namespace EHR_Reports.DTOs.Account
{
    public class LoginResponse
    {
        public UserDto User { get; set; }
        public string AccessToken { get; set; }
    }
}
