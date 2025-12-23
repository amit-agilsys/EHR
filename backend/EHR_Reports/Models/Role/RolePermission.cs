using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace EHR_Reports.Models.Role
{
    public class RolePermission
    {
        public int Id { get; set; }

        [Required]
        public string RoleId { get; set; }

        public int ScreenId { get; set; }

        public int ScreenActionId { get; set; }

        // Navigation properties
        public ApplicationRole Role { get; set; }
        public Screen Screen { get; set; }
        public ScreenAction ScreenAction { get; set; }
    }
}
