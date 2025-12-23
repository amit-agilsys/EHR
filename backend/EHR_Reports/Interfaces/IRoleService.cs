using EHR_Reports.DTOs;
using EHR_Reports.Models;

namespace EHR_Reports.Interfaces
{
    public interface IRoleService
    {
        Task<DataTableResponse<RoleResponseDto>> GetAllRoles(RoleDataTableRequest request);
        Task<ResponseModel<IEnumerable<RoleResponseDto>>> GetRolesList();
        Task<ResponseModel<RoleResponseDto>> GetRoleById(string roleId);
        Task<ResponseModel<bool>> CreateRole(CreateRoleDto roleDto);
        Task<ResponseModel<List<PermissionNameDto>>> UpdateRole(string roleId, CreateRoleDto dto);
        Task<ResponseModel<bool>> DeleteRole(string roleId);
        Task<List<PermissionNameDto>> GetUserPermissionsAsync(string userId);
    }
}
