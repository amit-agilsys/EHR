using System.ComponentModel.DataAnnotations;

namespace EHR_Reports.DTOs.Account
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Email is required")]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
