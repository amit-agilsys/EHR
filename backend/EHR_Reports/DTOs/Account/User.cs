namespace EHR_Reports.DTOs.Account
{
    public class UserDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public bool EmailConfirmed { get; set; }
        public string Role { get; set; }
        public string RoleId { get; set; }
        public List<PermissionNameDto> Permissions { get; set; }
    }
}
