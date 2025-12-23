using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class DoctorController : Controller
    {
        private readonly IDoctorService _doctorService;
        public DoctorController(IDoctorService doctorService)
        {
            _doctorService = doctorService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDoctors([FromQuery] DataTableRequest dataTableRequest)
        {
            var response = await _doctorService.GetAllDoctors(dataTableRequest);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet]
        public async Task<IActionResult> SearchDoctorByName([FromQuery] string query)
        {
            var response = await _doctorService.SearchDoctorByName(query);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDoctorById(int id)
        {
            var response = await _doctorService.GetDoctorById(id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDoctor([FromBody] Doctor doctorDto)
        {
            var response = await _doctorService.AddDoctor(doctorDto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPatch]
        public async Task<IActionResult> UpdateDoctor([FromBody] Doctor doctorDto)
        {
            var response = await _doctorService.UpdateDoctor(doctorDto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var response = await _doctorService.DeleteDoctor(id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

    }
}
