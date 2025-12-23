using EHR_Reports.Data;
using EHR_Reports.DTOs;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using EHR_Reports.Models.Role;
using EHR_Reports.Utilities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EHR_Reports.Services
{
    public class RoleService : IRoleService
    {
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly ApplicationDbContext _context;

        public RoleService(RoleManager<ApplicationRole> roleManager, ApplicationDbContext context)
        {
            _roleManager = roleManager;
            _context = context;
        }

        public async Task<DataTableResponse<RoleResponseDto>> GetAllRoles(RoleDataTableRequest request)
        {
            try
            {
                var query = _roleManager.Roles.AsNoTracking().AsQueryable();

                if (!string.IsNullOrEmpty(request.Search))
                {
                    var searchText = request.Search.Trim().ToLower();
                    query = query.Where(r => r.Name.ToLower().Contains(searchText));
                }

                if (request.RoleStatus.HasValue)
                {
                    query = query.Where(x => x.IsActive == request.RoleStatus.Value);
                }

                var totalRecords = await _roleManager.Roles.CountAsync();
                var filteredRecords = await query.CountAsync();

                var sortColumn = request.SortColumn;
                if (!string.IsNullOrEmpty(sortColumn))
                {
                    sortColumn = sortColumn switch
                    {
                        "roleName" => "Name",
                        "roleId" => "Id",
                        "isActive" => "IsActive",
                        _ => "Name" // default
                    };

                    var orderDirection = request.SortDirection;
                    query = orderDirection == "asc"
                        ? query.OrderByDynamic(sortColumn, true)
                        : query.OrderByDynamic(sortColumn, false);
                }
                else
                {
                    query = query.OrderByDynamic("Name", true);
                }

                var page = request.Page > 0 ? request.Page : 1;
                var limit = request.Limit > 0 ? request.Limit : totalRecords;

                var roles = await query
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync();

                var response = new List<RoleResponseDto>();
                foreach (var role in roles)
                {
                    var permissions = await _context.RolePermissions
                        .Where(rp => rp.RoleId == role.Id)
                        .Include(rp => rp.Screen)
                        .Include(rp => rp.ScreenAction)
                        .Select(rp => new PermissionDto
                        {
                            ScreenId = rp.Screen.Id,
                            ActionId = rp.ScreenAction.Id
                        })
                        .ToListAsync();

                    response.Add(new RoleResponseDto
                    {
                        RoleId = role.Id,
                        RoleName = role.Name,
                        IsActive = role.IsActive,
                        Permissions = permissions
                    });
                }

                return new DataTableResponse<RoleResponseDto>
                {
                    Success = true,
                    Message = "Roles retrieved successfully.",
                    Data = response,
                    TotalRecords = totalRecords,
                    FilteredRecords = filteredRecords
                };
            }
            catch (Exception ex)
            {
                return new DataTableResponse<RoleResponseDto>
                {
                    Success = false,
                    Message = $"Error retrieving roles: {ex.Message}",
                    Data = null,
                    TotalRecords = 0,
                    FilteredRecords = 0
                };
            }
        }


        public async Task<ResponseModel<IEnumerable<RoleResponseDto>>> GetRolesList()
        {
            try
            {
                var roles = await _roleManager.Roles.Where(x => x.IsActive == true).ToListAsync();
                var response = roles.Select(role => new RoleResponseDto
                {
                    RoleId = role.Id,
                    RoleName = role.Name,
                }).ToList();

                return ResponseModel<IEnumerable<RoleResponseDto>>.SuccessResult(response, "Roles retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<IEnumerable<RoleResponseDto>>.Failure($"Error retrieving roles: {ex.Message}");
            }
        }
        public async Task<ResponseModel<RoleResponseDto>> GetRoleById(string roleId)
        {
            try
            {
                var role = await _roleManager.FindByIdAsync(roleId);
                if (role == null) return null;

                var permissions = await _context.RolePermissions
                    .Where(rp => rp.RoleId == roleId)
                    .Include(rp => rp.Screen)
                    .Include(rp => rp.ScreenAction)
                    .Select(rp => new PermissionDto
                    {
                        ScreenId = rp.Screen.Id,
                        ActionId = rp.ScreenAction.Id
                    })
                    .ToListAsync();

                return ResponseModel<RoleResponseDto>.SuccessResult(new RoleResponseDto
                {
                    RoleId = role.Id,
                    RoleName = role.Name,
                    IsActive = true,
                    Permissions = permissions
                }, "Role retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<RoleResponseDto>.Failure($"Error retrieving role: {ex.Message}");
            }
        }
        public async Task<ResponseModel<bool>> CreateRole(CreateRoleDto roleDto)
        {
            try
            {
                var existingRole = await _roleManager.FindByNameAsync(roleDto.RoleName);
                if (existingRole != null)
                {
                    return ResponseModel<bool>.Failure($"Role '{roleDto.RoleName}' already exists.");
                }

                var role = new ApplicationRole()
                {
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    IsActive = roleDto.IsActive,
                    Name = roleDto.RoleName,
                };

                // Create the role
                var result = await _roleManager.CreateAsync(role);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description).ToList();
                    return ResponseModel<bool>.Failure(errors);
                }

                // Add permissions
                var permissions = roleDto.Permissions.Select(p => new RolePermission
                {
                    RoleId = role.Id,
                    ScreenId = p.ScreenId,
                    ScreenActionId = p.ActionId
                }).ToList();

                await _context.RolePermissions.AddRangeAsync(permissions);
                await _context.SaveChangesAsync();

                return ResponseModel<bool>.SuccessResult(true, "Role created successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<bool>.Failure($"Error creating role: {ex.Message}");
            }
        }
        public async Task<ResponseModel<List<PermissionNameDto>>> UpdateRole(string roleId, CreateRoleDto dto)
        {
            try
            {
                var existingRole = await _roleManager.FindByIdAsync(roleId);
                if (existingRole == null)
                {
                    return ResponseModel<List<PermissionNameDto>>.Failure($"Role with ID '{roleId}' not found.");
                }
                // Check if the new role name already exists
                var roleWithSameName = await _roleManager.FindByNameAsync(dto.RoleName);
                if (roleWithSameName != null && roleWithSameName.Id != roleId)
                {
                    return ResponseModel<List<PermissionNameDto>>.Failure($"Role name '{dto.RoleName}' is already in use.");
                }

                existingRole.Name = dto.RoleName;
                existingRole.IsActive = dto.IsActive;
                await _roleManager.UpdateAsync(existingRole);

                // Remove old permissions
                var existingPermissions = await _context.RolePermissions
                    .Where(rp => rp.RoleId == roleId)
                    .ToListAsync();
                _context.RolePermissions.RemoveRange(existingPermissions);

                var newPermissions = dto.Permissions.Select(p => new RolePermission
                {
                    RoleId = roleId,
                    ScreenId = p.ScreenId,
                    ScreenActionId = p.ActionId
                }).ToList();

                await _context.RolePermissions.AddRangeAsync(newPermissions);
                var result = await _context.SaveChangesAsync();

                if (result == 0)
                {
                    return ResponseModel<List<PermissionNameDto>>.Failure("No changes were made.");
                }

                var permissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Join(_context.Screens,
                    rp => rp.ScreenId,
                    s => s.Id,
                    (rp, s) => new { rp, s })
                .Join(_context.ScreenActions,
                    x => x.rp.ScreenActionId,
                    sa => sa.Id,
                    (x, sa) => new PermissionNameDto
                    {
                        ScreenName = x.s.ScreenName,
                        ActionName = sa.ActionName
                    })
                .ToListAsync();

                return ResponseModel<List<PermissionNameDto>>.SuccessResult(permissions, "Role updated successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<List<PermissionNameDto>>.Failure($"Error updating role: {ex.Message}");
            }
        }
        public async Task<ResponseModel<bool>> DeleteRole(string roleId)
        {
            try
            {
                var role = await _roleManager.FindByIdAsync(roleId);
                if (role == null)
                {
                    return ResponseModel<bool>.Failure($"Role with ID '{roleId}' not found.");
                }
                var result = await _roleManager.DeleteAsync(role);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description).ToList();
                    return ResponseModel<bool>.Failure(errors);
                }
                return ResponseModel<bool>.SuccessResult(true, "Role deleted successfully.");
            }
            catch (Exception ex)
            {
                return ResponseModel<bool>.Failure($"Error deleting role: {ex.Message}");
            }
        }
        public async Task<List<PermissionNameDto>> GetUserPermissionsAsync(string userId)
        {
            var userRoleId = await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Select(ur => ur.RoleId)
                .FirstOrDefaultAsync();

            if (userRoleId == null)
                return new List<PermissionNameDto>();

            var permissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == userRoleId)
                .Join(_context.Screens,
                    rp => rp.ScreenId,
                    s => s.Id,
                    (rp, s) => new { rp, s })
                .Join(_context.ScreenActions,
                    x => x.rp.ScreenActionId,
                    sa => sa.Id,
                    (x, sa) => new PermissionNameDto
                    {
                        ScreenName = x.s.ScreenName,
                        ActionName = sa.ActionName
                    })
                .ToListAsync();

            return permissions;
        }
    }
}
