using EHR_Reports.Attributes;
using EHR_Reports.DTOs.Patiens;
using EHR_Reports.DTOs.Patient;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace EHR_Reports.Controllers
{
    [Route("api/[controller]/[action]")]
    [Authorize]
    [ApiController]

    public class PatientController : Controller
    {
        private readonly IPatientService _patientService;

        public PatientController(IPatientService patientService)
        {
            _patientService = patientService;
        }

        [HttpGet]
        [RequirePermission("Patients", "View")]
        public async Task<IActionResult> GetAllPatients([FromQuery] PatientDataTableRequest request)
        {
            var response = await _patientService.GetAllPatients(request);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet]
        public async Task<IActionResult> SearchPatientByName([FromQuery] string query)
        {
            var response = await _patientService.SearchPatientByName(query);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet("{id}")]
        [RequirePermission("Patients", "View")]
        public async Task<IActionResult> GetPatientById(int id)
        {
            var response = await _patientService.GetPatientById(id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost]
        [RequirePermission("Patients", "Add")]
        public async Task<IActionResult> CreatePatient([FromBody] PatientDto patientDto)
        {
            var response = await _patientService.CreatePatient(patientDto);
            if(!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPatch]
        [RequirePermission("Patients", "Edit")]
        public async Task<IActionResult> UpdatePatient([FromBody] PatientDto patientDto)
        {
            var response = await _patientService.UpdatePatient(patientDto);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("{id}")]
        [RequirePermission("Patients", "Delete")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var response = await _patientService.DeletePatient(id);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet]
        [RequirePermission("Encounters", "View")]
        public async Task<IActionResult> GetAllEncounters([FromQuery] EncounterDataTableRequest dataTableRequest)
        {
            if (!string.IsNullOrWhiteSpace(dataTableRequest.Search))
            {
                if (!Regex.IsMatch(dataTableRequest.Search, @"^\d+$"))
                {
                    var errorResponse = new DataTableResponse<PatientEncounterDto>
                    {
                        Success = false,
                        Message = "Invalid Admit Number. Only numeric values are allowed.",
                        Data = null,
                        TotalRecords = 0,
                        FilteredRecords = 0
                    };
                    return BadRequest(errorResponse);
                }
            }

            var response = await _patientService.GetAllEncounter(dataTableRequest);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet("{patientId}")]
        public async Task<IActionResult> GetEncountersByPatientId([FromQuery] EncounterDataTableRequest dataTableRequest, int patientId)
        {
            if(patientId == 0) return BadRequest("Patient Id is required");
            var response = await _patientService.GetEncountersByPatientId(dataTableRequest, patientId);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> CreateEncounter([FromBody] PatientEncounter patientEncounter)
        {
            var response = await _patientService.AddPatientEncounter(patientEncounter);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpPatch]
        public async Task<IActionResult> UpdateEncounter([FromBody] PatientEncounterDto encounter)
        {
            var response = await _patientService.UpdatePatientEncounter(encounter);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("{encounterId}")]
        public async Task<IActionResult> DeleteEncounter(int encounterId)
        {
            var response = await _patientService.DeletePatientEncounter(encounterId);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}
