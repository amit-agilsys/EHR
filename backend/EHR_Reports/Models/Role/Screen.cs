using System.ComponentModel.DataAnnotations;

namespace EHR_Reports.Models.Role
{
    public class Screen
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string ScreenName { get; set; }

        public bool IsActive { get; set; }

        // Navigation property
        public ICollection<ScreenAction> ScreenActions { get; set; } = new List<ScreenAction>();
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
