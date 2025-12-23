using Microsoft.AspNetCore.Identity;

namespace EHR_Reports.Models.Role
{
    public class ApplicationRole : IdentityRole
    {
        public bool IsActive { get; set; } = true;
        public ApplicationRole() : base() { }

        public ApplicationRole(string roleName) : base(roleName)
        {
            IsActive = true;
        }
    }
}
