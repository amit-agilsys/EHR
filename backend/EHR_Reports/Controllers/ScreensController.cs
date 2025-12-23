using EHR_Reports.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ScreensController : Controller
    {
        private readonly IScreenService _screenService;

        public ScreensController(IScreenService screenService)
        {
            _screenService = screenService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllScreens()
        {
            var response = await _screenService.GetScreensWithActions();
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}
