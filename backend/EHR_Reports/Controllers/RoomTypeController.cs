using EHR_Reports.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class RoomTypeController : Controller
    {
        private readonly IRoomTypeService _roomTypeService;

        public RoomTypeController(IRoomTypeService roomTypeService)
        {
            _roomTypeService = roomTypeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRoomTypes()
        {
            var response = await _roomTypeService.GetAllRoomTypes();
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

    }
}
