using EHR_Reports.Models;
using System.ComponentModel.DataAnnotations;

namespace EHR_Reports.DTOs
{
    public class RoleListDto
    {
        public String Id { get; set; }
        public string Name { get; set; }
    }

    public class CreateRoleDto
    {
        [Required]
        public string RoleName { get; set; }
        public bool IsActive { get; set; }
        public List<RolePermissionItemDto> Permissions { get; set; } = new();
    }

    public class RolePermissionItemDto
    {
        public int ScreenId { get; set; }
        public int ActionId { get; set; }
    }

    public class RoleResponseDto
    {
        public string RoleId { get; set; }
        public string RoleName { get; set; }
        public bool IsActive { get; set; }
        public List<PermissionDto> Permissions { get; set; }
    }

    public class PermissionDto
    {
        public int ScreenId { get; set; }
        public int ActionId { get; set; }
    }

    public class PermissionNameDto
    {
        public string ScreenName { get; set; }
        public string ActionName { get; set; }
    }

    public class RoleDataTableRequest : DataTableRequest
    {
        public bool? RoleStatus { get; set; }
    }
}
