using System.ComponentModel.DataAnnotations;

namespace EHR_Reports.DTOs.Account
{
    public class RegisterDto
    {
        [Required]
        [MinLength(3, ErrorMessage = "First name must be at least {1} characters long.")]
        public string FirstName { get; set; }
        [Required]
        [MinLength(3, ErrorMessage = "Last name must be at least {1} characters long.")]
        public string LastName { get; set; }
        [Required]
        [RegularExpression("^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$", ErrorMessage = "Invalid email address")]
        public string Email { get; set; }
        [Required]
        [MinLength(10, ErrorMessage = "Phone number must be {1} characters long.")]
        public string PhoneNumber { get; set; }

        [Required(ErrorMessage = "Role is required")]
        public string RoleId { get; set; }

        public enum Type
        {
            Doctor,
            RegularUser
        }
    }
}
