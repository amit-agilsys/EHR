using EHR_Reports.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class InsuranceController : Controller
    {
        private readonly IInsuranceService _insuranceService;
        public InsuranceController(IInsuranceService insuranceService)
        {
            _insuranceService = insuranceService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllInsurances()
        {
            var response = await _insuranceService.GetAllInsurances();
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}
