using System.ComponentModel.DataAnnotations;

namespace EHR_Reports.Models.Role
{
    public class ScreenAction
    {
        public int Id { get; set; }

        public int ScreenId { get; set; }

        [Required]
        [MaxLength(50)]
        public string ActionName { get; set; }

        public bool IsActive { get; set; }

        // Navigation properties
        public Screen Screen { get; set; }
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
