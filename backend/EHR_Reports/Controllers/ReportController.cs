using EHR_Reports.Attributes;
using EHR_Reports.DTOs.Report;
using EHR_Reports.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EHR_Reports.Controllers
{
    [Route("api/[controller]/[action]")]
    [Authorize]
    [ApiController]
    public class ReportController : Controller
    {
        private readonly IReportsService _reportsService;
        public ReportController(IReportsService reportsService)
        {
            _reportsService = reportsService;
        }

        [HttpGet]
        [RequirePermission("Reports", "daily-census")]
        public async Task<IActionResult> GetAllReports([FromQuery] DailyCensusRequest dataTableRequest)
        {
            var response = await _reportsService.GetDailyCensusReport(dataTableRequest);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet]
        [RequirePermission("Reports", "admission")]
        public async Task<IActionResult> GetAdmissionsReport([FromQuery] AdmissionsRequest dataTableRequest)
        {
            var response = await _reportsService.GetAdmissionsReport(dataTableRequest);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet]
        [RequirePermission("Reports", "discharge")]
        public async Task<IActionResult> GetDischargesReport([FromQuery] DischargesRequest dataTableRequest)
        {
            var response = await _reportsService.GetDischargesReport(dataTableRequest);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet]
        [RequirePermission("Reports", "re-admission")]
        public async Task<IActionResult> GetReadmissionsReport(ReadmissionsRequest request)
        {
            var response = await _reportsService.GetReadmissionsReport(request);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet]
        [RequirePermission("Reports", "observation-hours")]
        public async Task<IActionResult> GetObservationHoursReport(ObservationHoursRequest request)
        {
            var response = await _reportsService.GetObservationHoursReport(request);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        [HttpGet]
        [RequirePermission("Reports", "inpatient-census")]
        public async Task<IActionResult> GetInpatientCensusReport(InpatientCensusDaysRequest request)
        {
            var response = await _reportsService.GetInpatientCensusReport(request);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }


        [HttpGet]
        [RequirePermission("Reports", "daily-census")]
        public async Task<IActionResult> GenerateDailyCensusPdf([FromQuery] DailyCensusRequest dataTableRequest)
        {
            try
            {
                var pdfBytes = await _reportsService.GenerateDailyCensusPdf(dataTableRequest);
                return File(pdfBytes, "application/pdf", $"DailyCensus_${DateTime.Today}.pdf");

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        [RequirePermission("Reports", "admission")]
        public async Task<IActionResult> GenerateAdmissionPdf([FromQuery] AdmissionsRequest dataTableRequest)
        {
            try
            {
                var pdfBytes = await _reportsService.GenerateAdmissionPdf(dataTableRequest);
                return File(pdfBytes, "application/pdf", $"Admissions_${DateTime.Today}.pdf");

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        [RequirePermission("Reports", "discharge")]
        public async Task<IActionResult> GenerateDischargePdf([FromQuery] DischargesRequest dataTableRequest)
        {
            try
            {
                var pdfBytes = await _reportsService.GenerateDischargePdf(dataTableRequest);
                return File(pdfBytes, "application/pdf", $"Discharges_${DateTime.Today}.pdf");

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        [RequirePermission("Reports", "re-admission")]
        public async Task<IActionResult> GenerateReadmissionsPdf(ReadmissionsRequest dataTableRequest)
        {
            try
            {
                var pdfBytes = await _reportsService.GenerateReadmissionsPdf(dataTableRequest);
                return File(pdfBytes, "application/pdf", $"Readmissions_${DateTime.Today}.pdf");

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        [RequirePermission("Reports", "observation-hours")]
        public async Task<IActionResult> GenerateObservationHoursPdf(ObservationHoursRequest dataTableRequest)
        {
            try
            {
                var pdfBytes = await _reportsService.GenerateObservationHoursPdf(dataTableRequest);
                return File(pdfBytes, "application/pdf", $"ObservationHours_${DateTime.Today}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        [RequirePermission("Reports", "inpatient-census")]
        public async Task<IActionResult> GenerateInpatientCensusPdf(InpatientCensusDaysRequest dataTableRequest)
        {
            try
            {
                var pdfBytes = await _reportsService.GenerateInpatientCensusPdf(dataTableRequest);
                return File(pdfBytes, "application/pdf", $"InpatientCensus_${DateTime.Today}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
