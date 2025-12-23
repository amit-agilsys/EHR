using EHR_Reports.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class FinancialClassController : Controller
    {
        private readonly IFinancialClassService _financialClassService;

        public FinancialClassController(IFinancialClassService financialClassService)
        {
            _financialClassService = financialClassService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllFinancialClasses()
        {
            var response = await _financialClassService.GetAllFinancialClasses();
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}
