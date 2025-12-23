using EHR_Reports.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class DischargeStatusController : Controller
    {
        private readonly IDischargeStatusService _dischargeStatusService;

        public DischargeStatusController(IDischargeStatusService dischargeStatusService)
        {
            _dischargeStatusService = dischargeStatusService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDischargeStatuses()
        {
            var response = await _dischargeStatusService.GetAllDischargeStatuses();
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}
