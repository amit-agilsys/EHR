using EHR_Reports.Attributes;
using EHR_Reports.DTOs;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.Controllers
{
    [Route("api/[controller]/[action]")]
    [Authorize]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet]
        [RequirePermission("Roles", "View")]
        public async Task<IActionResult> GetAllRoles([FromQuery] RoleDataTableRequest dataTableRequest)
        {
            var response = await _roleService.GetAllRoles(dataTableRequest);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet]
        public async Task<IActionResult> GetRolesList()
        {
            var response = await _roleService.GetRolesList();
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet("{id}")]
        [RequirePermission("Roles", "View")]
        public async Task<IActionResult> GetRoleById(string id)
        {
            var response = await _roleService.GetRoleById(id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost]  
        [RequirePermission("Roles", "Add")]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto roleDto)
        {
            if (roleDto == null)
                return BadRequest(ResponseModel<CreateRoleDto>.Failure("Role cannot be null"));

            if (string.IsNullOrWhiteSpace(roleDto.RoleName))
                return BadRequest(ResponseModel<CreateRoleDto>.Failure("Role name cannot be empty"));

            var response = await _roleService.CreateRole(roleDto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPatch("{id}")]
        [RequirePermission("Roles", "Edit")]
        public async Task<IActionResult> UpdateRole(string id, [FromBody] CreateRoleDto roleDto)
        {
            if (id == null)
            {
                return BadRequest(ResponseModel<CreateRoleDto>.Failure("id cannot be null"));
            }
            if (roleDto == null)
            {
                return BadRequest(ResponseModel<CreateRoleDto>.Failure("name cannot be null"));
            }
            if (string.IsNullOrWhiteSpace(roleDto.RoleName))
            {
                return BadRequest(ResponseModel<bool>.Failure("Role name cannot be null or empty"));
            }

            var response = await _roleService.UpdateRole(id, roleDto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("{id}")] 
        [RequirePermission("Roles", "Delete")]
        public async Task<IActionResult> DeleteRole(string id)
        {
            var response = await _roleService.DeleteRole(id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

    }
}
