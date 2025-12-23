using EHR_Reports.Attributes;
using EHR_Reports.DTOs.Account;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.Controllers
{
    [Route("api/[controller]/[action]")]
    [Authorize]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }


        [HttpGet]
        [RequirePermission("Users", "View")]
        public async Task<IActionResult> GetAllUsers([FromQuery] UserDataTableRequest dataTableRequest)
        {
            var response = await _userService.GetAllUsers(dataTableRequest);
            if(!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet("{id}")]
        [RequirePermission("Users", "View")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var response = await _userService.GetUserById(id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost]
        [RequirePermission("Users", "Add")]
        public async Task<IActionResult> CreateUser([FromBody] UserDto userDto)
        {
            var response = await _userService.CreateUser(userDto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> SuspendUser(string id)
        {
            var response = await _userService.SuspendUser(id);
            return Ok(response);
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> ActivateUser(string id)
        {
            var response = await _userService.ActivateUser(id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPatch]
        [RequirePermission("Users", "Edit")]
        public async Task<IActionResult> UpdateUser([FromBody] UserDto userDto)
        {
            var response = await _userService.UpdateUser(userDto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete]   
        [RequirePermission("Users", "Delete")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var response = await _userService.DeleteUser(id);
            if (!response.Success)
            {
                 return BadRequest(response);
            }
            return Ok(response);
        }

    }
}
