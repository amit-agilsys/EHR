using EHR_Reports.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class PatientTypeController : Controller
    {
        private readonly IPatientTypeService _patientTypeService;

        public PatientTypeController(IPatientTypeService patientTypeService)
        {
            _patientTypeService = patientTypeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPatientTypes()
        {
            var response = await _patientTypeService.GetAllPatientTypes();
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}
